package app.ledgerservice.service;

import app.ledgerservice.entity.LedgerEntry;
import app.ledgerservice.entity.LedgerJournal;
import app.ledgerservice.event.LedgerTransactionSettledEvent;
import app.ledgerservice.repository.LedgerJournalRepository;
import app.ledgerservice.service.interfaces.ILedgerEntryService;
import app.ledgerservice.service.interfaces.ILedgerJournalService;
import app.ledgerservice.types.LedgerEntryDirection;
import app.ledgerservice.types.LedgerJournalStatus;
import app.ledgerservice.types.LedgerJournalType;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LedgerJournalService implements ILedgerJournalService {

    private static final String SOURCE_SERVICE = "wallet-service";

    private final LedgerJournalRepository ledgerJournalRepository;
    private final ILedgerEntryService ledgerEntryService;

    @Override
    public boolean existsBySourceEventId(String sourceEventId) {
        return ledgerJournalRepository.existsBySourceEventId(sourceEventId);
    }

    @Override
    public Optional<LedgerJournal> findBySourceEventId(String sourceEventId) {
        return ledgerJournalRepository.findBySourceEventId(sourceEventId);
    }

    @Override
    @Transactional
    public LedgerJournal postTransactionSettled(LedgerTransactionSettledEvent event) {
        String sourceEventId = event.eventId().toString();

        Optional<LedgerJournal> existingJournal = findBySourceEventId(sourceEventId);
        if (existingJournal.isPresent()) {
            log.info("Ledger journal already exists for sourceEventId={}", sourceEventId);
            return existingJournal.get();
        }

        validateEvent(event);

        LedgerJournal journal = new LedgerJournal();
        journal.setSourceService(SOURCE_SERVICE);
        journal.setSourceEventId(sourceEventId);
        journal.setCorrelationId(event.correlationId());
        journal.setTransferId(event.transferId());
        journal.setType(event.journalType() != null ? event.journalType() : LedgerJournalType.TRANSFER);
        journal.setStatus(LedgerJournalStatus.POSTED);
        journal.setDescription(event.description());
        journal.setPostedAt(event.occurredAt() != null ? event.occurredAt() : LocalDateTime.now());

        LedgerJournal savedJournal = ledgerJournalRepository.save(journal);
        List<LedgerEntry> entries = ledgerEntryService.createEntries(savedJournal, event.entries());
        savedJournal.setEntries(entries);

        log.info("Created ledger journal id={} for sourceEventId={}", savedJournal.getId(), sourceEventId);
        return savedJournal;
    }

    private void validateEvent(LedgerTransactionSettledEvent event) {
        if (event.eventId() == null) {
            throw new IllegalArgumentException("Ledger eventId is required.");
        }

        if (event.entries() == null || event.entries().isEmpty()) {
            throw new IllegalArgumentException("At least one ledger entry is required.");
        }

        Map<String, List<LedgerTransactionSettledEvent.EntryLine>> entriesByCurrency = event.entries().stream()
                .collect(Collectors.groupingBy(LedgerTransactionSettledEvent.EntryLine::currency));

        for (Map.Entry<String, List<LedgerTransactionSettledEvent.EntryLine>> currencyEntries : entriesByCurrency.entrySet()) {
            BigDecimal debits = totalForDirection(currencyEntries.getValue(), LedgerEntryDirection.DEBIT);
            BigDecimal credits = totalForDirection(currencyEntries.getValue(), LedgerEntryDirection.CREDIT);

            if (debits.compareTo(credits) != 0) {
                throw new IllegalArgumentException("Ledger entries are not balanced for currency " + currencyEntries.getKey() + ".");
            }
        }
    }

    private BigDecimal totalForDirection(
            List<LedgerTransactionSettledEvent.EntryLine> entries,
            LedgerEntryDirection direction) {
        return entries.stream()
                .filter(entry -> entry.direction() == direction)
                .map(LedgerTransactionSettledEvent.EntryLine::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
