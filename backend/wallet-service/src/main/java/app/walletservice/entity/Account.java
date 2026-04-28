package app.walletservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "account")
public class Account extends BaseEntity{

    public Account(String currency, Wallet wallet) {
        this.currency = currency;
        this.balance = BigDecimal.ZERO;
        this.availableBalance = BigDecimal.ZERO;
        this.wallet = wallet;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, unique = true)
    private UUID id;

    @Column(name = "iban", nullable = false, unique = true, length = 34)
    private String iban;

    @Column(name = "currency", nullable = false)
    private String currency;

    @Column(name = "balance", nullable = false, precision = 19, scale = 4)
    private BigDecimal balance;


    /**
     This tracks money the user can actually spend
     (Total Balance minus "Holds" or "Pending" transactions).
     */

    @Column(name = "available_balance", nullable = false, precision = 19, scale = 4)
    private BigDecimal availableBalance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @Version
    private Long version;



}
