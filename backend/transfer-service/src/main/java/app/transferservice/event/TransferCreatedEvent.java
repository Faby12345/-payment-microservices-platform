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
    String currency,
    TransferType type,
    String recipientIdentifier // Used for internal transfers
) {}
