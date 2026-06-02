package app.ledgerservice.dto;

import app.ledgerservice.types.LedgerEntryDirection;
import app.ledgerservice.types.LedgerEntryType;
import app.ledgerservice.types.LedgerJournalStatus;
import app.ledgerservice.types.LedgerJournalType;

import java.time.LocalDateTime;
import java.util.UUID;

public record LedgerEntrySearchRequest(
        UUID journalId,
        UUID userId,
        UUID walletAccountId,
        UUID transferId,
        String accountRef,
        String currency,
        LedgerEntryDirection direction,
        LedgerEntryType entryType,
        LedgerJournalType journalType,
        LedgerJournalStatus journalStatus,
        LocalDateTime postedFrom,
        LocalDateTime postedTo
) {
}
