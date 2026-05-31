package app.transferservice.event;

import app.transferservice.model.enums.TransferType;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Represents the message sent to RabbitMQ when a transfer is initiated.
 */
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
