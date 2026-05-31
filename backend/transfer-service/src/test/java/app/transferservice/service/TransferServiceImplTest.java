package app.transferservice.service;

import app.transferservice.client.WalletClient;
import app.transferservice.config.TransferProperties;
import app.transferservice.dto.AccountResponse;
import app.transferservice.dto.TransferRequest;
import app.transferservice.dto.TransferResponse;
import app.transferservice.event.TransferCreatedEvent;
import app.transferservice.model.ExchangeRate;
import app.transferservice.model.Transfer;
import app.transferservice.model.enums.TransferType;
import app.transferservice.producer.TransferProducer;
import app.transferservice.repository.ExchangeRateSnapshotRepository;
import app.transferservice.repository.TransferRepository;
import app.transferservice.service.interfaces.IExchangeRateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransferServiceImplTest {

    @Mock
    private TransferRepository transferRepository;

    @Mock
    private ExchangeRateSnapshotRepository exchangeRateSnapshotRepository;

    @Mock
    private TransferProducer transferProducer;

    @Mock
    private WalletClient walletClient;

    @Mock
    private IExchangeRateService exchangeRateService;

    private TransferServiceImpl transferService;

    @BeforeEach
    void setUp() {
        TransferProperties transferProperties = new TransferProperties();
        transferProperties.setInternal(new BigDecimal("0.01"));
        transferProperties.setExternal(new BigDecimal("0.025"));

        transferService = new TransferServiceImpl(
                transferRepository,
                exchangeRateSnapshotRepository,
                transferProducer,
                transferProperties,
                walletClient,
                exchangeRateService
        );

        when(transferRepository.save(any(Transfer.class))).thenAnswer(invocation -> {
            Transfer transfer = invocation.getArgument(0);
            transfer.setId(UUID.randomUUID());
            return transfer;
        });
    }

    @Test
    void shouldTransferSameCurrencyWithoutExchangeRateLookup() {
        UUID fromAccountId = UUID.randomUUID();
        String recipientIban = "RO99PAYM2222222222";

        when(walletClient.getAccountDetails(fromAccountId)).thenReturn(account(fromAccountId, "RO99PAYM1111111111", "EUR"));
        when(walletClient.findAccountByIban(recipientIban)).thenReturn(Optional.of(account(UUID.randomUUID(), recipientIban, "EUR")));

        TransferResponse response = transferService.initiateTransfer(request(fromAccountId, recipientIban, "EUR"));

        TransferCreatedEvent event = publishedEvent();
        assertThat(response.sourceAmount()).isEqualByComparingTo("100.00");
        assertThat(response.targetAmount()).isEqualByComparingTo("100.00");
        assertThat(response.exchangeRate()).isEqualByComparingTo("1.000000");
        assertThat(event.sourceCurrency()).isEqualTo("EUR");
        assertThat(event.targetCurrency()).isEqualTo("EUR");
        assertThat(event.totalDebited()).isEqualByComparingTo("102.50");

        verify(exchangeRateService, never()).getRate(any(), any());
    }

    @Test
    void shouldConvertDirectCurrencyToRonTransfer() {
        UUID fromAccountId = UUID.randomUUID();
        String recipientIban = "RO99PAYM3333333333";

        when(walletClient.getAccountDetails(fromAccountId)).thenReturn(account(fromAccountId, "RO99PAYM1111111111", "EUR"));
        when(walletClient.findAccountByIban(recipientIban)).thenReturn(Optional.of(account(UUID.randomUUID(), recipientIban, "RON")));
        when(exchangeRateService.getRate("EUR", "RON")).thenReturn(Optional.of(rate("EUR", "RON", "5.000000")));

        TransferResponse response = transferService.initiateTransfer(request(fromAccountId, recipientIban, "RON"));

        TransferCreatedEvent event = publishedEvent();
        assertThat(response.sourceAmount()).isEqualByComparingTo("100.00");
        assertThat(response.targetAmount()).isEqualByComparingTo("500.00");
        assertThat(response.exchangeRate()).isEqualByComparingTo("5.000000");
        assertThat(event.sourceCurrency()).isEqualTo("EUR");
        assertThat(event.targetCurrency()).isEqualTo("RON");
        assertThat(event.targetAmount()).isEqualByComparingTo("500.00");
        assertThat(event.feeAmount()).isEqualByComparingTo("2.50");
        assertThat(event.totalDebited()).isEqualByComparingTo("102.50");
    }

    @Test
    void shouldConvertCurrencyToCurrencyViaRonWhenDirectRateIsMissing() {
        UUID fromAccountId = UUID.randomUUID();
        String recipientIban = "RO99PAYM4444444444";

        when(walletClient.getAccountDetails(fromAccountId)).thenReturn(account(fromAccountId, "RO99PAYM1111111111", "EUR"));
        when(walletClient.findAccountByIban(recipientIban)).thenReturn(Optional.of(account(UUID.randomUUID(), recipientIban, "USD")));
        when(exchangeRateService.getRate("EUR", "USD")).thenReturn(Optional.empty());
        when(exchangeRateService.getRate("EUR", "RON")).thenReturn(Optional.of(rate("EUR", "RON", "5.000000")));
        when(exchangeRateService.getRate("RON", "USD")).thenReturn(Optional.of(rate("RON", "USD", "0.250000")));

        TransferResponse response = transferService.initiateTransfer(request(fromAccountId, recipientIban, "USD"));

        TransferCreatedEvent event = publishedEvent();
        assertThat(response.sourceAmount()).isEqualByComparingTo("100.00");
        assertThat(response.exchangeRate()).isEqualByComparingTo("1.250000");
        assertThat(response.targetAmount()).isEqualByComparingTo("125.00");
        assertThat(event.sourceCurrency()).isEqualTo("EUR");
        assertThat(event.targetCurrency()).isEqualTo("USD");
        assertThat(event.targetAmount()).isEqualByComparingTo("125.00");

        verify(exchangeRateService).getRate("EUR", "USD");
        verify(exchangeRateService).getRate("EUR", "RON");
        verify(exchangeRateService).getRate("RON", "USD");
    }

    private TransferCreatedEvent publishedEvent() {
        ArgumentCaptor<TransferCreatedEvent> eventCaptor = ArgumentCaptor.forClass(TransferCreatedEvent.class);
        verify(transferProducer).sendTransferCreatedEvent(eventCaptor.capture());
        return eventCaptor.getValue();
    }

    private TransferRequest request(UUID fromAccountId, String iban, String currency) {
        return TransferRequest.builder()
                .fromAccountId(fromAccountId)
                .amount(new BigDecimal("100.00"))
                .currency(currency)
                .type(TransferType.EXTERNAL)
                .recipientName("Recipient")
                .iban(iban)
                .description("Multi-currency transfer")
                .build();
    }

    private AccountResponse account(UUID accountId, String iban, String currency) {
        return AccountResponse.builder()
                .id(accountId)
                .iban(iban)
                .currency(currency)
                .balance(new BigDecimal("1000.00"))
                .availableBalance(new BigDecimal("1000.00"))
                .build();
    }

    private ExchangeRate rate(String baseCurrency, String targetCurrency, String rate) {
        return ExchangeRate.builder()
                .baseCurrency(baseCurrency)
                .targetCurrency(targetCurrency)
                .rate(new BigDecimal(rate))
                .build();
    }
}
