package app.walletservice.service;

import app.walletservice.dto.TransactionResponse;
import app.walletservice.dto.TransferRequest;
import app.walletservice.entity.TransactionHold;
import app.walletservice.mapper.TransactionMapper;
import app.walletservice.repository.TransactionRepository;
import app.walletservice.service.interfaces.ITransactionService;
import app.walletservice.service.interfaces.IWalletService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements ITransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final IWalletService walletService;

    @Override
    public List<TransactionResponse> getTransactionsByUserId(UUID userId) {
        return transactionMapper.toResponseList(
                transactionRepository.findByFromAccountWalletUserIdOrToAccountWalletUserIdOrderByCreatedAtDesc(userId, userId)
        );
    }

    @Transactional
    @Override
    public void processTransfer(TransferRequest request) {
        //  Reserve funds from Sender
        TransactionHold hold = walletService.reserveFunds(
                request.fromAccountId(),
                request.amount(),
                request.currency(),
                request.reference(),
                request.idempotencyKey()
        );

        try {
            //  Settle the hold (Takes money from Sender)
            walletService.settleHold(hold.getId());

            // 3. Credit the Receiver (Gives money to Receiver)
            walletService.creditAccount(
                    request.toAccountId(),
                    request.amount(),
                    request.currency(),
                    request.reference() + "_credit",
                    request.idempotencyKey() + "_credit"
            );

        } catch (Exception e) {
            //If anything fails after reservation, release the funds
            walletService.releaseHold(hold.getId());
            throw new RuntimeException("Transfer failed: " + e.getMessage());
        }
    }
}
