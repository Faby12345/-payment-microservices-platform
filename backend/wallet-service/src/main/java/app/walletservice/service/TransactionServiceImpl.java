package app.walletservice.service;

import app.walletservice.dto.TransactionResponse;
import app.walletservice.dto.TransferRequest;
import app.walletservice.entity.Account;
import app.walletservice.entity.TransactionHold;
import app.walletservice.event.LedgerEntryDirection;
import app.walletservice.event.LedgerEntryType;
import app.walletservice.event.LedgerJournalType;
import app.walletservice.event.LedgerTransactionSettledEvent;
import app.walletservice.event.TransferCreatedEvent;
import app.walletservice.event.TransferType;
import app.walletservice.entity.TransactionStatus;
import app.walletservice.entity.TransactionType;
import app.walletservice.mapper.TransactionMapper;
import app.walletservice.producer.LedgerEventProducer;
import app.walletservice.repository.AccountRepository;
import app.walletservice.repository.TransactionRepository;
import app.walletservice.repository.TransactionSpecification;
import app.walletservice.service.interfaces.ITransactionService;
import app.walletservice.service.interfaces.IWalletService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements ITransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final IWalletService walletService;
    private final AccountRepository accountRepository;
    private final LedgerEventProducer ledgerEventProducer;

    @Override
    public List<TransactionResponse> getTransactionsByUserId(UUID userId) {
        Specification<app.walletservice.entity.Transaction> spec = TransactionSpecification.hasUserId(userId);
        return transactionMapper.toResponseList(
                transactionRepository.findAll(spec)
        );
    }

    @Override
    public Page<TransactionResponse> getTransactionsByUserId(UUID userId, TransactionType type, TransactionStatus status, Pageable pageable) {
        Specification<app.walletservice.entity.Transaction> spec = Specification.allOf(
                TransactionSpecification.hasUserId(userId),
                TransactionSpecification.hasType(type),
                TransactionSpecification.hasStatus(status)
        );

        return transactionRepository.findAll(spec, pageable)
                .map(transactionMapper::toResponse);
    }

    @Transactional
    @Override
    public void processTransfer(TransferRequest request) {
        // Reserve funds from Sender (total amount)
        TransactionHold hold = walletService.reserveFunds(
                request.fromAccountId(),
                request.amount(), // Assuming REST request might already have total or fee is separate
                request.currency(),
                request.idempotencyKey(),
                request.reference(),
                request.idempotencyKey()
        );

        try {
            walletService.settleHold(hold.getId());

            walletService.creditAccount(
                    request.toAccountId(),
                    request.amount(),
                    request.currency(),
                    request.idempotencyKey() + "_credit",
                    request.reference(),
                    request.idempotencyKey() + "_credit"
            );

        } catch (Exception e) {
            walletService.releaseHold(hold.getId());
            throw new RuntimeException("Transfer failed: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void processTransferFromEvent(TransferCreatedEvent event) {
        log.info("Processing transfer event: ID={}, FromAccount={}, Recipient={}, TotalDebited={}",
                event.transferId(), event.fromAccountId(), event.recipientIdentifier(), event.totalDebited());

        if (event.sourceCurrency().equalsIgnoreCase(event.targetCurrency())) {
            processSingleCurrencyTransfer(event);
        } else {
            processMultiCurrencyTransfer(event);
        }
    }

    private void processSingleCurrencyTransfer(TransferCreatedEvent event) {
        TransactionHold hold = debitSender(event);

        try {
            walletService.settleHold(hold.getId());
            Optional<Account> recipient = creditInternalRecipient(event);
            publishLedgerEvent(event, recipient);
        } catch (Exception e) {
            log.error("Failed to process same-currency transfer event {}: {}", event.transferId(), e.getMessage());
            throw e;
        }
    }

    private void processMultiCurrencyTransfer(TransferCreatedEvent event) {
        TransactionHold hold = debitSender(event);

        try {
            walletService.settleHold(hold.getId());
            Optional<Account> recipient = creditInternalRecipient(event);
            publishLedgerEvent(event, recipient);
        } catch (Exception e) {
            log.error("Failed to process multi-currency transfer event {}: {}", event.transferId(), e.getMessage());
            throw e;
        }
    }

    private TransactionHold debitSender(TransferCreatedEvent event) {
        TransactionHold hold = walletService.reserveFunds(
                event.fromAccountId(),
                event.totalDebited(),
                event.sourceCurrency(),
                event.transferId().toString(),
                event.description(),
                event.transferId().toString()
        );

        return hold;
    }

    private Optional<Account> creditInternalRecipient(TransferCreatedEvent event) {
        Optional<Account> toAccountOpt = accountRepository.findByIban(event.recipientIdentifier());

        if (toAccountOpt.isPresent()) {
            Account recipient = toAccountOpt.get();
            log.info("Recipient IBAN {} found in-house. Crediting {} {}.",
                    event.recipientIdentifier(), event.targetAmount(), event.targetCurrency());

            walletService.creditAccount(
                    recipient.getId(),
                    event.targetAmount(),
                    event.targetCurrency(),
                    event.transferId().toString() + "_credit",
                    event.description(),
                    event.transferId().toString() + "_credit"
            );
            return Optional.of(recipient);
        } else if (event.type() == TransferType.INTERNAL) {
            log.error("Internal transfer failed: No account found for IBAN {}", event.recipientIdentifier());
            throw new RuntimeException("Internal recipient account not found!");
        } else {
            log.info("Real external transfer to IBAN: {}. Debit complete.", event.recipientIdentifier());
            return Optional.empty();
        }
    }

    private void publishLedgerEvent(TransferCreatedEvent event, Optional<Account> recipient) {
        LedgerTransactionSettledEvent ledgerEvent = new LedgerTransactionSettledEvent(
                event.transferId(),
                event.transferId(),
                event.transferId().toString(),
                LedgerJournalType.TRANSFER,
                event.description(),
                LocalDateTime.now(),
                buildLedgerEntries(event, recipient)
        );

        ledgerEventProducer.publishTransactionSettledAfterCommit(ledgerEvent);
    }

    private List<LedgerTransactionSettledEvent.EntryLine> buildLedgerEntries(
            TransferCreatedEvent event,
            Optional<Account> recipient) {
        Account sender = accountRepository
                .findById(event.fromAccountId())
                .orElseThrow(() -> new RuntimeException("Sender account not found!"));

        List<LedgerTransactionSettledEvent.EntryLine> entries = new ArrayList<>();

        if (event.sourceCurrency().equalsIgnoreCase(event.targetCurrency())) {
            addEntry
                    (entries,
                    walletAccountRef(sender.getId()),
                    sender.getId(),
                    sender.getWallet().getUserId(),
                    event.sourceCurrency(),
                    LedgerEntryDirection.DEBIT,
                    event.sourceAmount(),
                    LedgerEntryType.PRINCIPAL);

            addEntry(entries,
                    walletAccountRef(sender.getId()),
                    sender.getId(),
                    sender.getWallet().getUserId(),
                    event.feeCurrency(),
                    LedgerEntryDirection.DEBIT,
                    event.feeAmount(),
                    LedgerEntryType.FEE);

            recipient.ifPresentOrElse(
                    account -> addEntry(
                            entries,
                            walletAccountRef(account.getId()),
                            account.getId(),
                            account.getWallet().getUserId(),
                            event.targetCurrency(),
                            LedgerEntryDirection.CREDIT,
                            event.targetAmount(),
                            LedgerEntryType.PRINCIPAL),
                    () -> addEntry(
                            entries,
                            externalClearingRef(event.targetCurrency()),
                            null,
                            null,
                            event.targetCurrency(),
                            LedgerEntryDirection.CREDIT,
                            event.targetAmount(),
                            LedgerEntryType.EXTERNAL_CLEARING)
            );

            addEntry(entries,
                    feeRevenueRef(event.feeCurrency()),
                    null,
                    null,
                    event.feeCurrency(),
                    LedgerEntryDirection.CREDIT,
                    event.feeAmount(),
                    LedgerEntryType.FEE);
            return entries;
        }

        addEntry(entries,
                walletAccountRef(sender.getId()),
                sender.getId(),
                sender.getWallet().getUserId(),
                event.sourceCurrency(),
                LedgerEntryDirection.DEBIT,
                event.sourceAmount(),
                LedgerEntryType.PRINCIPAL);

        addEntry(entries,
                walletAccountRef(sender.getId()),
                sender.getId(),
                sender.getWallet().getUserId(),
                event.feeCurrency(),
                LedgerEntryDirection.DEBIT,
                event.feeAmount(),
                LedgerEntryType.FEE);

        addEntry(entries,
                fxClearingRef(event.sourceCurrency()),
                null,
                null,
                event.sourceCurrency(),
                LedgerEntryDirection.CREDIT,
                event.sourceAmount(),
                LedgerEntryType.FX_CLEARING);

        addEntry(entries,
                feeRevenueRef(event.feeCurrency()),
                null,
                null,
                event.feeCurrency(),
                LedgerEntryDirection.CREDIT,
                event.feeAmount(),
                LedgerEntryType.FEE);

        addEntry(entries,
                fxClearingRef(event.targetCurrency()),
                null,
                null,
                event.targetCurrency(),
                LedgerEntryDirection.DEBIT,
                event.targetAmount(),
                LedgerEntryType.FX_CLEARING);

        recipient.ifPresentOrElse(
                account -> addEntry(entries,
                        walletAccountRef(account.getId()),
                        account.getId(),
                        account.getWallet().getUserId(),
                        event.targetCurrency(),
                        LedgerEntryDirection.CREDIT,
                        event.targetAmount(),
                        LedgerEntryType.PRINCIPAL),
                () -> addEntry(entries,
                        externalClearingRef(event.targetCurrency()),
                        null,
                        null,
                        event.targetCurrency(),
                        LedgerEntryDirection.CREDIT,
                        event.targetAmount(),
                        LedgerEntryType.EXTERNAL_CLEARING)
        );

        return entries;
    }

    private void addEntry(
            List<LedgerTransactionSettledEvent.EntryLine> entries,
            String accountRef,
            UUID walletAccountId,
            UUID userId,
            String currency,
            LedgerEntryDirection direction,
            BigDecimal amount,
            LedgerEntryType entryType) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) {
            return;
        }

        entries.add(new LedgerTransactionSettledEvent.EntryLine(
                accountRef,
                walletAccountId,
                userId,
                currency,
                direction,
                amount,
                entryType
        ));
    }

    private String walletAccountRef(UUID accountId) {
        return "WALLET:" + accountId;
    }

    private String feeRevenueRef(String currency) {
        return "PLATFORM:FEE:" + currency;
    }

    private String fxClearingRef(String currency) {
        return "PLATFORM:FX_CLEARING:" + currency;
    }

    private String externalClearingRef(String currency) {
        return "PLATFORM:EXTERNAL_CLEARING:" + currency;
    }
}
