package app.walletservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TransactionResponse {
    private UUID id;
    private String type;
    private String status;
    private String sourceCurrency;
    private BigDecimal sourceAmount;
    private String destinationCurrency;
    private BigDecimal destinationAmount;
    private String description;
    private String reference;
    private LocalDateTime createdAt;
}
