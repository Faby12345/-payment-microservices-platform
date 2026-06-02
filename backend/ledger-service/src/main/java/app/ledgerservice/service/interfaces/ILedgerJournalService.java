package app.ledgerservice.service.interfaces;

import app.ledgerservice.entity.LedgerJournal;
import app.ledgerservice.event.LedgerTransactionSettledEvent;

import java.util.Optional;

public interface ILedgerJournalService {

    boolean existsBySourceEventId(String sourceEventId);

    Optional<LedgerJournal> findBySourceEventId(String sourceEventId);

    LedgerJournal postTransactionSettled(LedgerTransactionSettledEvent event);
}
