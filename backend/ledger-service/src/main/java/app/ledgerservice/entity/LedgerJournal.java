package app.ledgerservice.entity;

import app.ledgerservice.types.LedgerJournalStatus;
import app.ledgerservice.types.LedgerJournalType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "ledger_journals")
public class LedgerJournal extends BaseEntity {

    @Column(nullable = false, length = 64)
    private String sourceService;

    @Column(nullable = false, length = 128)
    private String sourceEventId;

    @Column(length = 128)
    private String correlationId;

    @Column
    private UUID transferId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private LedgerJournalType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private LedgerJournalStatus status;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private LocalDateTime postedAt;

    @OneToMany(mappedBy = "journal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LedgerEntry> entries = new ArrayList<>();
}
