package app.walletservice.service.interfaces;

import app.walletservice.dto.TransactionResponse;
import app.walletservice.dto.TransferRequest;
import app.walletservice.event.TransferCreatedEvent;

import app.walletservice.entity.TransactionStatus;
import app.walletservice.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ITransactionService {
    List<TransactionResponse> getTransactionsByUserId(UUID userId);
    Page<TransactionResponse> getTransactionsByUserId(UUID userId, TransactionType type, TransactionStatus status, Pageable pageable);
    void processTransfer(TransferRequest request);
    void processTransferFromEvent(TransferCreatedEvent event);
}
