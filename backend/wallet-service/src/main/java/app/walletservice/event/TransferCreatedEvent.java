package app.walletservice.event;

import java.math.BigDecimal;
import java.util.UUID;

public record TransferCreatedEvent(
    UUID transferId,
    UUID fromAccountId,
    BigDecimal amount,
    BigDecimal totalDeducted,
    String currency,
    TransferType type,
    String recipientIdentifier,
    String description
) {}
