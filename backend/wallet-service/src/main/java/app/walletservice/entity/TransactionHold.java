package app.walletservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Table(name = "transaction_holds")
public class TransactionHold extends BaseEntity {

    public TransactionHold(Account account, BigDecimal amount,
                           String currency, TransactionHoldStatus status,
                           String reference, String idempotencyKey) {
        this.account = account;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.reference = reference;
        this.idempotencyKey = idempotencyKey;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionHoldStatus status;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "reference", unique = true, length = 64)
    private String reference;

    @Column(name = "idempotency_key", unique = true, length = 64)
    private String idempotencyKey;

    // Link to the resulting transaction once 'CAPTURED'
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;
}
