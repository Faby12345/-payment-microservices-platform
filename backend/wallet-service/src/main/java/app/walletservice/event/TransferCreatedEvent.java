package app.walletservice.event;

import java.math.BigDecimal;
import java.util.UUID;

public record TransferCreatedEvent(
    UUID transferId,
    UUID fromAccountId,
    BigDecimal sourceAmount,
    String sourceCurrency,
    BigDecimal targetAmount,
    String targetCurrency,
    BigDecimal feeAmount,
    String feeCurrency,
    BigDecimal totalDebited,
    BigDecimal exchangeRate,
    TransferType type,
    String recipientIdentifier,
    String description
) {}
