package app.ledgerservice.mapper;

import app.ledgerservice.dto.LedgerEntryResponseDto;
import app.ledgerservice.dto.LedgerJournalResponseDto;
import app.ledgerservice.entity.LedgerEntry;
import app.ledgerservice.entity.LedgerJournal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class LedgerDtoMapper {

    public LedgerEntryResponseDto toEntryDto(LedgerEntry entry) {
        return new LedgerEntryResponseDto(
                entry.getId(),
                entry.getJournal() != null ? entry.getJournal().getId() : null,
                entry.getAccountRef(),
                entry.getWalletAccountId(),
                entry.getUserId(),
                entry.getCurrency(),
                entry.getDirection(),
                entry.getAmount(),
                entry.getEntryType(),
                entry.getCreatedAt(),
                entry.getUpdatedAt()
        );
    }

    public LedgerJournalResponseDto toJournalDto(LedgerJournal journal) {
        List<LedgerEntryResponseDto> entries = journal.getEntries() == null
                ? List.of()
                : journal.getEntries().stream().map(this::toEntryDto).toList();

        return new LedgerJournalResponseDto(
                journal.getId(),
                journal.getSourceService(),
                journal.getSourceEventId(),
                journal.getCorrelationId(),
                journal.getTransferId(),
                journal.getType(),
                journal.getStatus(),
                journal.getDescription(),
                journal.getPostedAt(),
                journal.getCreatedAt(),
                journal.getUpdatedAt(),
                entries
        );
    }
}
