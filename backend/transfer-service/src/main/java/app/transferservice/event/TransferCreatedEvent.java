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
    BigDecimal amount,
    BigDecimal totalDeducted, // Total amount to be taken from sender (including fees)
    String currency,
    TransferType type,
    String recipientIdentifier,
    String description
) {}
