package app.ledgerservice.service;

import app.ledgerservice.entity.LedgerEntry;
import app.ledgerservice.entity.LedgerJournal;
import app.ledgerservice.event.LedgerTransactionSettledEvent;
import app.ledgerservice.repository.LedgerEntryRepository;
import app.ledgerservice.service.interfaces.ILedgerEntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LedgerEntryService implements ILedgerEntryService {

    private final LedgerEntryRepository ledgerEntryRepository;

    @Override
    public List<LedgerEntry> createEntries(LedgerJournal journal, List<LedgerTransactionSettledEvent.EntryLine> entryLines) {
        List<LedgerEntry> entries = entryLines.stream()
                .map(entryLine -> toLedgerEntry(journal, entryLine))
                .toList();

        return ledgerEntryRepository.saveAll(entries);
    }

    private LedgerEntry toLedgerEntry(LedgerJournal journal, LedgerTransactionSettledEvent.EntryLine entryLine) {
        LedgerEntry entry = new LedgerEntry();
        entry.setJournal(journal);
        entry.setAccountRef(entryLine.accountRef());
        entry.setWalletAccountId(entryLine.walletAccountId());
        entry.setUserId(entryLine.userId());
        entry.setCurrency(entryLine.currency());
        entry.setDirection(entryLine.direction());
        entry.setAmount(entryLine.amount());
        entry.setEntryType(entryLine.entryType());
        return entry;
    }
}
