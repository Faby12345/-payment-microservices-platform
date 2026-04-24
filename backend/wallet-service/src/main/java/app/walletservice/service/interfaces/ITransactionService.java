package app.walletservice.service.interfaces;

import app.walletservice.dto.TransactionResponse;
import java.util.List;
import java.util.UUID;

public interface ITransactionService {
    List<TransactionResponse> getTransactionsByUserId(UUID userId);
}
