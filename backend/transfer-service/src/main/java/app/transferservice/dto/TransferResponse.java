package app.transferservice.dto;

import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record TransferResponse(
    UUID transactionId,
    TransactionStatus status,
    BigDecimal amount,
    BigDecimal fee,
    BigDecimal totalDeducted,
    String currency,
    LocalDateTime timestamp,
    String message,
    String estimatedDelivery
) {
    public enum TransactionStatus {
        PENDING, COMPLETED, FAILED
    }
}
