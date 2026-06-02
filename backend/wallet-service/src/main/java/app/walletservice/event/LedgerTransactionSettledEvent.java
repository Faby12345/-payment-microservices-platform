package app.walletservice.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record LedgerTransactionSettledEvent(
        UUID eventId,
        UUID transferId,
        String correlationId,
        LedgerJournalType journalType,
        String description,
        LocalDateTime occurredAt,
        List<EntryLine> entries
) {

    public record EntryLine(
            String accountRef,
            UUID walletAccountId,
            UUID userId,
            String currency,
            LedgerEntryDirection direction,
            BigDecimal amount,
            LedgerEntryType entryType
    ) {
    }
}
