package app.ledgerservice.dto;

import app.ledgerservice.types.LedgerJournalStatus;
import app.ledgerservice.types.LedgerJournalType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record LedgerJournalResponseDto(
        UUID id,
        String sourceService,
        String sourceEventId,
        String correlationId,
        UUID transferId,
        LedgerJournalType type,
        LedgerJournalStatus status,
        String description,
        LocalDateTime postedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<LedgerEntryResponseDto> entries
) {
}
