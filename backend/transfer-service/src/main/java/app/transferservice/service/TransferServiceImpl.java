package app.transferservice.service;

import app.transferservice.client.WalletClient;
import app.transferservice.config.TransferProperties;
import app.transferservice.dto.AccountResponse;
import app.transferservice.dto.TransferRequest;
import app.transferservice.dto.TransferResponse;
import app.transferservice.event.TransferCreatedEvent;
import app.transferservice.exception.InvalidTransferException;
import app.transferservice.model.ExchangeRate;
import app.transferservice.model.ExchangeRateSnapshot;
import app.transferservice.model.Transfer;
import app.transferservice.model.enums.TransactionStatus;
import app.transferservice.model.enums.TransferType;
import app.transferservice.producer.TransferProducer;
import app.transferservice.repository.ExchangeRateSnapshotRepository;
import app.transferservice.repository.TransferRepository;
import app.transferservice.service.interfaces.IExchangeRateService;
import app.transferservice.service.interfaces.TransferService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@AllArgsConstructor
@Slf4j
public class TransferServiceImpl implements TransferService {
    private static final String RON = "RON";
    private static final int MONEY_SCALE = 2;
    private static final int RATE_SCALE = 6;

    private final TransferRepository transferRepository;
    private final ExchangeRateSnapshotRepository exchangeRateSnapshotRepository;
    private final TransferProducer transferProducer;
    private final TransferProperties transferProperties;
    private final WalletClient walletClient;
    private final IExchangeRateService exchangeRateService;

    @Override
    @Transactional
    public TransferResponse initiateTransfer(TransferRequest request) {
        log.info("Initiating transfer request: {}", request);

        // 1. Fetch Source Account Details to get IBAN
        AccountResponse sourceAccount = walletClient.getAccountDetails(request.fromAccountId());
        String sourceIban = sourceAccount.getIban();
        String sourceCurrency = normalizeCurrency(sourceAccount.getCurrency());

        // 2. Validate against Self-Transfer
        String destinationIban = (request.type() == TransferType.INTERNAL) 
                ? request.recipientIdentifier() 
                : request.iban();

        if (sourceIban.equalsIgnoreCase(destinationIban)) {
            log.error("Self-transfer detected for IBAN: {}", sourceIban);
            throw new InvalidTransferException("You cannot send money to the same account.");
        }

        String targetCurrency = resolveTargetCurrency(request, sourceCurrency);
        BigDecimal sourceAmount = roundMoney(request.amount());
        BigDecimal exchangeRate = resolveExchangeRate(sourceCurrency, targetCurrency);
        BigDecimal targetAmount = convert(sourceAmount, exchangeRate);

        BigDecimal feePercent = (request.type() == TransferType.EXTERNAL) 
                ? transferProperties.getExternal() 
                : transferProperties.getInternal();

        BigDecimal fee = roundMoney(sourceAmount.multiply(feePercent));
        BigDecimal total = roundMoney(sourceAmount.add(fee));

        Transfer transfer = Transfer.builder()
                .fromAccountId(request.fromAccountId())
                .amount(sourceAmount)
                .currency(sourceCurrency)
                .sourceAmount(sourceAmount)
                .sourceCurrency(sourceCurrency)
                .targetAmount(targetAmount)
                .targetCurrency(targetCurrency)
                .type(request.type())
                .status(TransactionStatus.PENDING)
                .fee(fee)
                .feeCurrency(sourceCurrency)
                .totalDebited(total)
                .exchangeRate(exchangeRate)
                .recipientIdentifier(request.recipientIdentifier())
                .recipientName(request.recipientName())
                .iban(request.iban())
                .bic(request.bic())
                .description(request.description())
                .build();

        Transfer savedTransfer = transferRepository.save(transfer);
        saveExchangeRateSnapshot(savedTransfer, sourceCurrency, targetCurrency, exchangeRate);

        TransferCreatedEvent event = new TransferCreatedEvent(
                savedTransfer.getId(),
                savedTransfer.getFromAccountId(),
                savedTransfer.getSourceAmount(),
                savedTransfer.getSourceCurrency(),
                savedTransfer.getTargetAmount(),
                savedTransfer.getTargetCurrency(),
                savedTransfer.getFee(),
                savedTransfer.getFeeCurrency(),
                savedTransfer.getTotalDebited(),
                savedTransfer.getExchangeRate(),
                savedTransfer.getType(),
                destinationIban,
                savedTransfer.getDescription()
        );

        transferProducer.sendTransferCreatedEvent(event);

        return TransferResponse.builder()
                .transactionId(savedTransfer.getId())
                .status(savedTransfer.getStatus())
                .amount(savedTransfer.getAmount())
                .fee(savedTransfer.getFee())
                .totalDeducted(total)
                .currency(savedTransfer.getCurrency())
                .sourceAmount(savedTransfer.getSourceAmount())
                .sourceCurrency(savedTransfer.getSourceCurrency())
                .targetAmount(savedTransfer.getTargetAmount())
                .targetCurrency(savedTransfer.getTargetCurrency())
                .exchangeRate(savedTransfer.getExchangeRate())
                .timestamp(LocalDateTime.now())
                .message("Transfer initiated successfully and is being processed.")
                .estimatedDelivery(request.type() == TransferType.INTERNAL ? "Instant" : "1-2 Business Days")
                .build();
    }

    private String resolveTargetCurrency(TransferRequest request, String sourceCurrency) {
        String destinationIban = (request.type() == TransferType.INTERNAL)
                ? request.recipientIdentifier()
                : request.iban();

        if (request.type() == TransferType.INTERNAL) {
            if (destinationIban == null || destinationIban.isBlank()) {
                throw new InvalidTransferException("Recipient IBAN is required for internal transfers.");
            }
            AccountResponse recipientAccount = walletClient.getAccountByIban(destinationIban);
            return normalizeCurrency(recipientAccount.getCurrency());
        }

        if (destinationIban != null && !destinationIban.isBlank()) {
            return walletClient.findAccountByIban(destinationIban)
                    .map(AccountResponse::getCurrency)
                    .map(this::normalizeCurrency)
                    .orElseGet(() -> resolveExternalTargetCurrency(request, sourceCurrency));
        }

        return resolveExternalTargetCurrency(request, sourceCurrency);
    }

    private String resolveExternalTargetCurrency(TransferRequest request, String sourceCurrency) {
        if (request.currency() == null || request.currency().isBlank()) {
            return sourceCurrency;
        }
        return normalizeCurrency(request.currency());
    }

    private BigDecimal resolveExchangeRate(String sourceCurrency, String targetCurrency) {
        if (sourceCurrency.equals(targetCurrency)) {
            return BigDecimal.ONE.setScale(RATE_SCALE, RoundingMode.HALF_UP);
        }

        return exchangeRateService.getRate(sourceCurrency, targetCurrency)
                .map(ExchangeRate::getRate)
                .or(() -> resolveRateViaRon(sourceCurrency, targetCurrency))
                .map(rate -> rate.setScale(RATE_SCALE, RoundingMode.HALF_UP))
                .orElseThrow(() -> new InvalidTransferException(
                        "Exchange rate not found for " + sourceCurrency + " to " + targetCurrency));
    }

    private java.util.Optional<BigDecimal> resolveRateViaRon(String sourceCurrency, String targetCurrency) {
        if (RON.equals(sourceCurrency) || RON.equals(targetCurrency)) {
            return java.util.Optional.empty();
        }

        return exchangeRateService.getRate(sourceCurrency, RON)
                .flatMap(sourceToRon -> exchangeRateService.getRate(RON, targetCurrency)
                        .map(ronToTarget -> sourceToRon.getRate().multiply(ronToTarget.getRate())));
    }

    private BigDecimal convert(BigDecimal sourceAmount, BigDecimal exchangeRate) {
        return sourceAmount.multiply(exchangeRate).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }

    private BigDecimal roundMoney(BigDecimal amount) {
        return amount.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }

    private String normalizeCurrency(String currency) {
        if (currency == null || currency.isBlank()) {
            throw new InvalidTransferException("Currency is required.");
        }
        return currency.trim().toUpperCase();
    }

    private void saveExchangeRateSnapshot(Transfer transfer, String sourceCurrency, String targetCurrency, BigDecimal exchangeRate) {
        ExchangeRateSnapshot snapshot = ExchangeRateSnapshot.builder()
                .transfer(transfer)
                .baseCurrency(sourceCurrency)
                .targetCurrency(targetCurrency)
                .rate(exchangeRate)
                .expiryTime(LocalDateTime.now().plusMinutes(15))
                .build();

        exchangeRateSnapshotRepository.save(snapshot);
    }
}
