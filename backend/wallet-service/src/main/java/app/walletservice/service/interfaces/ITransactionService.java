package app.walletservice.service.interfaces;

import app.walletservice.dto.TransactionResponse;
import app.walletservice.dto.TransferRequest;
import java.util.List;
import java.util.UUID;

public interface ITransactionService {
    List<TransactionResponse> getTransactionsByUserId(UUID userId);
    void processTransfer(TransferRequest request);
}
