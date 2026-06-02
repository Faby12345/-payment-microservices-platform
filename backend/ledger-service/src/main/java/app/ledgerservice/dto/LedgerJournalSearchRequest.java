package app.ledgerservice.dto;

import app.ledgerservice.types.LedgerEntryDirection;
import app.ledgerservice.types.LedgerEntryType;
import app.ledgerservice.types.LedgerJournalStatus;
import app.ledgerservice.types.LedgerJournalType;

import java.time.LocalDateTime;
import java.util.UUID;

public record LedgerJournalSearchRequest(
        UUID userId,
        UUID walletAccountId,
        UUID transferId,
        String sourceEventId,
        String correlationId,
        LedgerJournalType type,
        LedgerJournalStatus status,
        String currency,
        LedgerEntryDirection direction,
        LedgerEntryType entryType,
        LocalDateTime postedFrom,
        LocalDateTime postedTo
) {
}
