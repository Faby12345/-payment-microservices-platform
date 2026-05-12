package app.transferservice.dto.exchange;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class ExchangeRateHistoryResponse {
    private String baseCurrency;
    private String targetCurrency;
    private BigDecimal rate;
    private LocalDate rateDate;
}
