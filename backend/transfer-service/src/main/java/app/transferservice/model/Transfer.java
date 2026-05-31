package app.transferservice.model;

import app.transferservice.model.enums.TransactionStatus;
import app.transferservice.model.enums.TransferType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "transfers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transfer extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID fromAccountId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false)
    private BigDecimal sourceAmount;

    @Column(nullable = false, length = 3)
    private String sourceCurrency;

    @Column(nullable = false)
    private BigDecimal targetAmount;

    @Column(nullable = false, length = 3)
    private String targetCurrency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransferType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    private BigDecimal fee;

    @Column(length = 3)
    private String feeCurrency;

    private BigDecimal totalDebited;

    @Column(precision = 18, scale = 6)
    private BigDecimal exchangeRate;

    // Internal Transfer Info
    private String recipientIdentifier;

    // External Transfer Info (IBAN)
    private String recipientName;
    private String iban;
    private String bic;

    private String description;
}
