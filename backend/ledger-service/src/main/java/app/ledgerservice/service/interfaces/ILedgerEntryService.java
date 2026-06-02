package app.ledgerservice.service.interfaces;

import app.ledgerservice.entity.LedgerEntry;
import app.ledgerservice.entity.LedgerJournal;
import app.ledgerservice.event.LedgerTransactionSettledEvent;

import java.util.List;

public interface ILedgerEntryService {

    List<LedgerEntry> createEntries(LedgerJournal journal, List<LedgerTransactionSettledEvent.EntryLine> entryLines);
}
