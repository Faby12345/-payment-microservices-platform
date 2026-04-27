package app.transferservice.model;

import app.transferservice.model.enums.TransactionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "transfer_status_history")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferStatusHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transfer_id", nullable = false)
    private Transfer transfer;

    @Enumerated(EnumType.STRING)
    private TransactionStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus toStatus;

    private String reason;
}
