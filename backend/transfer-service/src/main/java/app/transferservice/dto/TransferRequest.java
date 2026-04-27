package app.transferservice.dto;

import jakarta.validation.constraints.*;
import lombok.Builder;
import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record TransferRequest(
    @NotNull(message = "Source account is required")
    UUID fromAccountId,

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    BigDecimal amount,

    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency must be a 3-letter ISO code")
    String currency,

    @NotNull(message = "Transfer type is required")
    TransferType type,

    // --- INTERNAL TRANSFER FIELDS (Friend) ---
    String recipientIdentifier,

    // --- EXTERNAL TRANSFER FIELDS (IBAN) ---
    String recipientName,
    String iban,
    String bic,
    
    String description
) {
    public enum TransferType {
        INTERNAL, EXTERNAL
    }
}
