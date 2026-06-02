package app.ledgerservice.dto;

import app.ledgerservice.types.LedgerEntryDirection;
import app.ledgerservice.types.LedgerEntryType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record LedgerEntryResponseDto(
        UUID id,
        UUID journalId,
        String accountRef,
        UUID walletAccountId,
        UUID userId,
        String currency,
        LedgerEntryDirection direction,
        BigDecimal amount,
        LedgerEntryType entryType,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
