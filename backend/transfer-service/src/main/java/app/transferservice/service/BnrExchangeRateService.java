package app.transferservice.service;

import app.transferservice.dto.bnr.BnrDataSet;
import app.transferservice.model.ExchangeRate;
import app.transferservice.model.ExchangeRateHistory;
import app.transferservice.repository.ExchangeRateHistoryRepository;
import app.transferservice.repository.ExchangeRateRepository;
import app.transferservice.service.interfaces.IExchangeRateService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BnrExchangeRateService implements IExchangeRateService {

    private final ExchangeRateRepository exchangeRateRepository;
    private final ExchangeRateHistoryRepository historyRepository;
    private final RestTemplate restTemplate;

    private static final String BNR_URL = "https://www.bnr.ro/nbrfxrates.xml";
    private static final String BASE_CURRENCY = "RON";
    private static final List<String> SUPPORTED_CURRENCIES = List.of(
            "EUR", "USD", "GBP", "CHF", "CAD", "AUD", "JPY", "CZK", "PLN", "HUF"
    );

    @PostConstruct
    public void onStartup() {
        log.info("Checking for exchange rate updates on startup...");
        fetchAndProcessRates();
    }

    @Scheduled(cron = "0 0 14 * * MON-FRI") // BNR usually updates around 13:00 - 14:00 EET
    public void scheduledUpdate() {
        log.info("Running scheduled exchange rate update...");
        fetchAndProcessRates();
    }

    @Override
    @Transactional
    public void fetchAndProcessRates() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<BnrDataSet> response = restTemplate.exchange(
                    BNR_URL,
                    HttpMethod.GET,
                    entity,
                    BnrDataSet.class
            );

            BnrDataSet dataSet = response.getBody();
            if (dataSet == null || dataSet.getBody() == null || dataSet.getBody().getCube() == null) {
                log.warn("Could not fetch or parse BNR exchange rates.");
                return;
            }

            LocalDate rateDate = LocalDate.parse(dataSet.getBody().getCube().getDate());
            
            if (historyRepository.existsByRateDate(rateDate)) {
                log.info("Rates for date {} already exist in history. Skipping update.", rateDate);
                return;
            }

            log.info("Processing BNR rates for date: {}", rateDate);
            List<BnrDataSet.BnrRate> bnrRates = dataSet.getBody().getCube().getRates();
            List<ExchangeRateHistory> historyList = new ArrayList<>();

            for (BnrDataSet.BnrRate bnrRate : bnrRates) {
                String currency = bnrRate.getCurrency();
                
                // Only process supported currencies
                if (!SUPPORTED_CURRENCIES.contains(currency)) {
                    continue;
                }

                BigDecimal value = new BigDecimal(bnrRate.getValue());
                Integer multiplier = bnrRate.getMultiplier();

                if (multiplier != null && multiplier > 1) {
                    value = value.divide(BigDecimal.valueOf(multiplier), 6, RoundingMode.HALF_UP);
                }

                // Update current master rates (Base: RON)
                updateMasterRate(BASE_CURRENCY, currency, value);
                
                // Inverse rate
                BigDecimal inverseValue = BigDecimal.ONE.divide(value, 6, RoundingMode.HALF_UP);
                updateMasterRate(currency, BASE_CURRENCY, inverseValue);

                // Add to history
                historyList.add(ExchangeRateHistory.builder()
                        .baseCurrency(BASE_CURRENCY)
                        .targetCurrency(currency)
                        .rate(value)
                        .rateDate(rateDate)
                        .build());
            }

            if (!historyList.isEmpty()) {
                historyRepository.saveAll(historyList);
                log.info("Successfully updated {} supported currency rates from BNR.", historyList.size());
            }

        } catch (Exception e) {
            log.error("Error during BNR exchange rate processing: {}", e.getMessage(), e);
        }
    }

    @Override
    public List<ExchangeRate> getAllCurrentRates() {
        return exchangeRateRepository.findAll();
    }

    @Override
    public Optional<ExchangeRate> getRate(String baseCurrency, String targetCurrency) {
        return exchangeRateRepository.findByBaseCurrencyAndTargetCurrency(baseCurrency.toUpperCase(), targetCurrency.toUpperCase());
    }

    @Override
    public List<ExchangeRateHistory> getHistoryByDate(LocalDate date) {
        return historyRepository.findAll().stream()
                .filter(h -> h.getRateDate().equals(date))
                .toList();
    }

    @Override
    @Transactional
    public void updateRate(String base, String target, BigDecimal rate) {
        updateMasterRate(base, target, rate);
    }

    private void updateMasterRate(String base, String target, BigDecimal rate) {
        ExchangeRate exchangeRate = exchangeRateRepository.findByBaseCurrencyAndTargetCurrency(base, target)
                .orElse(ExchangeRate.builder()
                        .baseCurrency(base)
                        .targetCurrency(target)
                        .build());
        
        exchangeRate.setRate(rate);
        exchangeRateRepository.save(exchangeRate);
    }
}
