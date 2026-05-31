package app.walletservice.service;

import app.walletservice.dto.TransactionResponse;
import app.walletservice.dto.TransferRequest;
import app.walletservice.entity.Account;
import app.walletservice.entity.TransactionHold;
import app.walletservice.event.TransferCreatedEvent;
import app.walletservice.event.TransferType;
import app.walletservice.entity.TransactionStatus;
import app.walletservice.entity.TransactionType;
import app.walletservice.mapper.TransactionMapper;
import app.walletservice.repository.AccountRepository;
import app.walletservice.repository.TransactionRepository;
import app.walletservice.repository.TransactionSpecification;
import app.walletservice.service.interfaces.ITransactionService;
import app.walletservice.service.interfaces.IWalletService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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
        Specification<app.walletservice.entity.Transaction> spec = TransactionSpecification.hasUserId(userId);
        return transactionMapper.toResponseList(
                transactionRepository.findAll(spec)
        );
    }

    @Override
    public Page<TransactionResponse> getTransactionsByUserId(UUID userId, TransactionType type, TransactionStatus status, Pageable pageable) {
        Specification<app.walletservice.entity.Transaction> spec = Specification.allOf(
                TransactionSpecification.hasUserId(userId),
                TransactionSpecification.hasType(type),
                TransactionSpecification.hasStatus(status)
        );

        return transactionRepository.findAll(spec, pageable)
                .map(transactionMapper::toResponse);
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
        log.info("Processing transfer event: ID={}, FromAccount={}, Recipient={}, TotalDebited={}",
                event.transferId(), event.fromAccountId(), event.recipientIdentifier(), event.totalDebited());

        if (event.sourceCurrency().equalsIgnoreCase(event.targetCurrency())) {
            processSingleCurrencyTransfer(event);
        } else {
            processMultiCurrencyTransfer(event);
        }
    }

    private void processSingleCurrencyTransfer(TransferCreatedEvent event) {
        TransactionHold hold = debitSender(event);

        try {
            walletService.settleHold(hold.getId());
            creditInternalRecipient(event);
        } catch (Exception e) {
            log.error("Failed to process same-currency transfer event {}: {}", event.transferId(), e.getMessage());
            throw e;
        }
    }

    private void processMultiCurrencyTransfer(TransferCreatedEvent event) {
        TransactionHold hold = debitSender(event);

        try {
            walletService.settleHold(hold.getId());
            creditInternalRecipient(event);
        } catch (Exception e) {
            log.error("Failed to process multi-currency transfer event {}: {}", event.transferId(), e.getMessage());
            throw e;
        }
    }

    private TransactionHold debitSender(TransferCreatedEvent event) {
        TransactionHold hold = walletService.reserveFunds(
                event.fromAccountId(),
                event.totalDebited(),
                event.sourceCurrency(),
                event.transferId().toString(),
                event.description(),
                event.transferId().toString()
        );

        return hold;
    }

    private void creditInternalRecipient(TransferCreatedEvent event) {
        Optional<Account> toAccountOpt = accountRepository.findByIban(event.recipientIdentifier());

        if (toAccountOpt.isPresent()) {
            Account recipient = toAccountOpt.get();
            log.info("Recipient IBAN {} found in-house. Crediting {} {}.",
                    event.recipientIdentifier(), event.targetAmount(), event.targetCurrency());

            walletService.creditAccount(
                    recipient.getId(),
                    event.targetAmount(),
                    event.targetCurrency(),
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
    }
}
