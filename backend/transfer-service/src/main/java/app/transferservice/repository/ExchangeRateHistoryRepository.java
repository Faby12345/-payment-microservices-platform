package app.transferservice.repository;

import app.transferservice.model.ExchangeRateHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExchangeRateHistoryRepository extends JpaRepository<ExchangeRateHistory, UUID> {
    boolean existsByRateDate(LocalDate rateDate);
    List<ExchangeRateHistory> findByBaseCurrencyAndTargetCurrencyOrderByRateDateDesc(String baseCurrency, String targetCurrency);
}
