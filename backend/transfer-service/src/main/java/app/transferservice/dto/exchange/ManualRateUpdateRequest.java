package app.transferservice.dto.exchange;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ManualRateUpdateRequest {
    @NotBlank
    private String baseCurrency;
    
    @NotBlank
    private String targetCurrency;
    
    @NotNull
    @Positive
    private BigDecimal rate;
}
