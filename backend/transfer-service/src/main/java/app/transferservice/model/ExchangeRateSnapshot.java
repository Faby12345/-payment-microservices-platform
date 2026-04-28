package app.transferservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "exchange_rate_snapshots")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeRateSnapshot extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transfer_id", nullable = false)
    private Transfer transfer;

    @Column(nullable = false, length = 3)
    private String baseCurrency;

    @Column(nullable = false, length = 3)
    private String targetCurrency;

    @Column(nullable = false, precision = 18, scale = 6)
    private BigDecimal rate;

    @Column(nullable = false)
    private LocalDateTime expiryTime;
}
