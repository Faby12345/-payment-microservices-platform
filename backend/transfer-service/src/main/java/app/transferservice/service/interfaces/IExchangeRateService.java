package app.transferservice.service.interfaces;

import app.transferservice.model.ExchangeRate;
import app.transferservice.model.ExchangeRateHistory;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;

public interface IExchangeRateService {
    /**
     * Triggers a manual update of exchange rates from the external provider.
     */
    void fetchAndProcessRates();

    /**
     * Returns all current exchange rates.
     */
    List<ExchangeRate> getAllCurrentRates();

    /**
     * Returns the current exchange rate for a specific pair.
     */
    Optional<ExchangeRate> getRate(String baseCurrency, String targetCurrency);

    /**
     * Returns historical rates for a specific date.
     */
    List<ExchangeRateHistory> getHistoryByDate(LocalDate date);

    /**
     * Manually updates a specific exchange rate.
     */
    void updateRate(String baseCurrency, String targetCurrency, BigDecimal rate);
}
