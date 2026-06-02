package app.ledgerservice.controller;

import app.ledgerservice.dto.LedgerEntryResponseDto;
import app.ledgerservice.dto.LedgerEntrySearchRequest;
import app.ledgerservice.dto.LedgerJournalResponseDto;
import app.ledgerservice.dto.LedgerJournalSearchRequest;
import app.ledgerservice.service.interfaces.ILedgerEntryService;
import app.ledgerservice.service.interfaces.ILedgerJournalService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ledger")
@RequiredArgsConstructor
public class LedgerController {

    private final ILedgerJournalService ledgerJournalService;
    private final ILedgerEntryService ledgerEntryService;

    @GetMapping("/journals")
    public Page<LedgerJournalResponseDto> getJournals(
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) UUID walletAccountId,
            @RequestParam(required = false) UUID transferId,
            @RequestParam(required = false) String sourceEventId,
            @RequestParam(required = false) String correlationId,
            @RequestParam(required = false) app.ledgerservice.types.LedgerJournalType type,
            @RequestParam(required = false) app.ledgerservice.types.LedgerJournalStatus status,
            @RequestParam(required = false) String currency,
            @RequestParam(required = false) app.ledgerservice.types.LedgerEntryDirection direction,
            @RequestParam(required = false) app.ledgerservice.types.LedgerEntryType entryType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime postedFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime postedTo,
            Pageable pageable) {

        LedgerJournalSearchRequest request = new LedgerJournalSearchRequest(
                userId,
                walletAccountId,
                transferId,
                sourceEventId,
                correlationId,
                type,
                status,
                currency,
                direction,
                entryType,
                postedFrom,
                postedTo
        );
        return ledgerJournalService.getJournals(request, pageable);
    }

    @GetMapping("/journals/{journalId}")
    public LedgerJournalResponseDto getJournal(@PathVariable UUID journalId) {
        return ledgerJournalService.getJournalById(journalId);
    }

    @GetMapping("/transfers/{transferId}/journals")
    public Page<LedgerJournalResponseDto> getJournalsByTransferId(
            @PathVariable UUID transferId,
            Pageable pageable) {
        return ledgerJournalService.getJournalsByTransferId(transferId, pageable);
    }

    @GetMapping("/entries")
    public Page<LedgerEntryResponseDto> getEntries(
            @RequestParam(required = false) UUID journalId,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) UUID walletAccountId,
            @RequestParam(required = false) UUID transferId,
            @RequestParam(required = false) String accountRef,
            @RequestParam(required = false) String currency,
            @RequestParam(required = false) app.ledgerservice.types.LedgerEntryDirection direction,
            @RequestParam(required = false) app.ledgerservice.types.LedgerEntryType entryType,
            @RequestParam(required = false) app.ledgerservice.types.LedgerJournalType journalType,
            @RequestParam(required = false) app.ledgerservice.types.LedgerJournalStatus journalStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime postedFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime postedTo,
            Pageable pageable) {

        LedgerEntrySearchRequest request = new LedgerEntrySearchRequest(
                journalId,
                userId,
                walletAccountId,
                transferId,
                accountRef,
                currency,
                direction,
                entryType,
                journalType,
                journalStatus,
                postedFrom,
                postedTo
        );
        return ledgerEntryService.getEntries(request, pageable);
    }

    @GetMapping("/users/{userId}/entries")
    public Page<LedgerEntryResponseDto> getEntriesByUserId(
            @PathVariable UUID userId,
            Pageable pageable) {
        return ledgerEntryService.getEntriesByUserId(userId, pageable);
    }

    @GetMapping("/accounts/{walletAccountId}/entries")
    public Page<LedgerEntryResponseDto> getEntriesByWalletAccountId(
            @PathVariable UUID walletAccountId,
            Pageable pageable) {
        return ledgerEntryService.getEntriesByWalletAccountId(walletAccountId, pageable);
    }
}
