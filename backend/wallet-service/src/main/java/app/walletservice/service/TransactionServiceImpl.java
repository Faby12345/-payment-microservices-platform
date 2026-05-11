package app.walletservice.service;

import app.walletservice.dto.TransactionResponse;
import app.walletservice.dto.TransferRequest;
import app.walletservice.entity.Account;
import app.walletservice.entity.TransactionHold;
import app.walletservice.event.TransferCreatedEvent;
import app.walletservice.event.TransferType;
import app.walletservice.mapper.TransactionMapper;
import app.walletservice.repository.AccountRepository;
import app.walletservice.repository.TransactionRepository;
import app.walletservice.service.interfaces.ITransactionService;
import app.walletservice.service.interfaces.IWalletService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements ITransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final IWalletService walletService;
    private final AccountRepository accountRepository;

    @Override
    public List<TransactionResponse> getTransactionsByUserId(UUID userId) {
        return transactionMapper.toResponseList(
                transactionRepository.findByFromAccountWalletUserIdOrToAccountWalletUserIdOrderByCreatedAtDesc(userId, userId)
        );
    }

    @Transactional
    @Override
    public void processTransfer(TransferRequest request) {
        // Reserve funds from Sender (total amount)
        TransactionHold hold = walletService.reserveFunds(
                request.fromAccountId(),
                request.amount(), // Assuming REST request might already have total or fee is separate
                request.currency(),
                request.idempotencyKey(),
                request.reference(),
                request.idempotencyKey()
        );

        try {
            walletService.settleHold(hold.getId());

            walletService.creditAccount(
                    request.toAccountId(),
                    request.amount(),
                    request.currency(),
                    request.idempotencyKey() + "_credit",
                    request.reference(),
                    request.idempotencyKey() + "_credit"
            );

        } catch (Exception e) {
            walletService.releaseHold(hold.getId());
            throw new RuntimeException("Transfer failed: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void processTransferFromEvent(TransferCreatedEvent event) {
        log.info("Processing transfer event: ID={}, FromAccount={}, Recipient={}, TotalDeducted={}", 
                event.transferId(), event.fromAccountId(), event.recipientIdentifier(), event.totalDeducted());

        /// 1. DEBIT THE SENDER (Total amount including fees)
        TransactionHold hold = walletService.reserveFunds(
                event.fromAccountId(),
                event.totalDeducted(),         // Use totalDeducted for the sender
                event.currency(),
                event.transferId().toString(), 
                event.description(),           
                event.transferId().toString()  
        );

        try {
            //  Settle the hold (Takes money from Sender)
            walletService.settleHold(hold.getId());

            /// 2. RESOLVE THE RECIPIENT
            Optional<Account> toAccountOpt = accountRepository.findByIban(event.recipientIdentifier());

            if (toAccountOpt.isPresent()) {
                log.info("Recipient IBAN {} found in-house. Processing internal credit of {}.", 
                        event.recipientIdentifier(), event.amount());
                
                // Credit the recipient only the base amount (fees stay with the bank)
                walletService.creditAccount(
                        toAccountOpt.get().getId(),
                        event.amount(),                // Use base amount for recipient
                        event.currency(),
                        event.transferId().toString() + "_credit", 
                        event.description(),                      
                        event.transferId().toString() + "_credit"  
                );
            } else if (event.type() == TransferType.INTERNAL) {
                log.error("Internal transfer failed: No account found for IBAN {}", event.recipientIdentifier());
                throw new RuntimeException("Internal recipient account not found!");
            } else {
                log.info("Real external transfer to IBAN: {}. Debit complete.", event.recipientIdentifier());
            }

        }  catch (Exception e) {
            log.error("Failed to process transfer event {}: {}", event.transferId(), e.getMessage());
            // Note: If we throw here, the transaction rolls back, including settleHold
            throw e; 
        }
    }
}
