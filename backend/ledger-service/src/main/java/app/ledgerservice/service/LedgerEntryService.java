package app.ledgerservice.service;

import app.ledgerservice.dto.LedgerEntryResponseDto;
import app.ledgerservice.dto.LedgerEntrySearchRequest;
import app.ledgerservice.mapper.LedgerDtoMapper;
import app.ledgerservice.entity.LedgerEntry;
import app.ledgerservice.entity.LedgerJournal;
import app.ledgerservice.event.LedgerTransactionSettledEvent;
import app.ledgerservice.repository.LedgerEntryRepository;
import app.ledgerservice.repository.specification.LedgerEntrySpecification;
import app.ledgerservice.service.interfaces.ILedgerEntryService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LedgerEntryService implements ILedgerEntryService {

    private final LedgerEntryRepository ledgerEntryRepository;
    private final LedgerDtoMapper ledgerDtoMapper;

    @Override
    public List<LedgerEntry> createEntries(LedgerJournal journal, List<LedgerTransactionSettledEvent.EntryLine> entryLines) {
        List<LedgerEntry> entries = entryLines.stream()
                .map(entryLine -> toLedgerEntry(journal, entryLine))
                .toList();

        return ledgerEntryRepository.saveAll(entries);
    }

    @Override
    @Transactional
    public Page<LedgerEntryResponseDto> getEntries(LedgerEntrySearchRequest request, Pageable pageable) {
        return ledgerEntryRepository.findAll(LedgerEntrySpecification.by(request), pageable)
                .map(ledgerDtoMapper::toEntryDto);
    }

    @Override
    @Transactional
    public Page<LedgerEntryResponseDto> getEntriesByUserId(UUID userId, Pageable pageable) {
        LedgerEntrySearchRequest request = new LedgerEntrySearchRequest(
                null,
                userId,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );
        return getEntries(request, pageable);
    }

    @Override
    @Transactional
    public Page<LedgerEntryResponseDto> getEntriesByWalletAccountId(UUID walletAccountId, Pageable pageable) {
        LedgerEntrySearchRequest request = new LedgerEntrySearchRequest(
                null,
                null,
                walletAccountId,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );
        return getEntries(request, pageable);
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
