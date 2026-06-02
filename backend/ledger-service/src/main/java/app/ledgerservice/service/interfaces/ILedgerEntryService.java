package app.ledgerservice.service.interfaces;

import app.ledgerservice.entity.LedgerEntry;
import app.ledgerservice.entity.LedgerJournal;
import app.ledgerservice.event.LedgerTransactionSettledEvent;
import app.ledgerservice.dto.LedgerEntryResponseDto;
import app.ledgerservice.dto.LedgerEntrySearchRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ILedgerEntryService {

    List<LedgerEntry> createEntries(LedgerJournal journal, List<LedgerTransactionSettledEvent.EntryLine> entryLines);

    Page<LedgerEntryResponseDto> getEntries(LedgerEntrySearchRequest request, Pageable pageable);

    Page<LedgerEntryResponseDto> getEntriesByUserId(UUID userId, Pageable pageable);

    Page<LedgerEntryResponseDto> getEntriesByWalletAccountId(UUID walletAccountId, Pageable pageable);
}
