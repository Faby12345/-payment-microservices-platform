package app.ledgerservice.service.interfaces;

import app.ledgerservice.entity.LedgerJournal;
import app.ledgerservice.event.LedgerTransactionSettledEvent;
import app.ledgerservice.dto.LedgerJournalResponseDto;
import app.ledgerservice.dto.LedgerJournalSearchRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface ILedgerJournalService {

    boolean existsBySourceEventId(String sourceEventId);

    Optional<LedgerJournal> findBySourceEventId(String sourceEventId);

    LedgerJournal postTransactionSettled(LedgerTransactionSettledEvent event);

    Page<LedgerJournalResponseDto> getJournals(LedgerJournalSearchRequest request, Pageable pageable);

    Page<LedgerJournalResponseDto> getJournalsByTransferId(UUID transferId, Pageable pageable);

    LedgerJournalResponseDto getJournalById(UUID journalId);
}
