package app.ledgerservice.repository;

import app.ledgerservice.entity.LedgerJournal;
import app.ledgerservice.types.LedgerJournalStatus;
import app.ledgerservice.types.LedgerJournalType;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LedgerJournalRepository extends JpaRepository<LedgerJournal, UUID>, JpaSpecificationExecutor<LedgerJournal> {

    Optional<LedgerJournal> findBySourceEventId(String sourceEventId);

    boolean existsBySourceEventId(String sourceEventId);

    List<LedgerJournal> findByTransferId(UUID transferId);

    List<LedgerJournal> findByCorrelationId(String correlationId);

    List<LedgerJournal> findByType(LedgerJournalType type);

    List<LedgerJournal> findByStatus(LedgerJournalStatus status);
}
