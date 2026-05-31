package app.transferservice.dto;

import app.transferservice.model.enums.TransactionStatus;
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
    BigDecimal sourceAmount,
    String sourceCurrency,
    BigDecimal targetAmount,
    String targetCurrency,
    BigDecimal exchangeRate,
    LocalDateTime timestamp,
    String message,
    String estimatedDelivery
) {}
