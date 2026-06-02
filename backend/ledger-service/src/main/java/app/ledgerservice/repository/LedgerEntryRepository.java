package app.ledgerservice.repository;

import app.ledgerservice.entity.LedgerEntry;
import app.ledgerservice.types.LedgerEntryDirection;
import app.ledgerservice.types.LedgerEntryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, UUID> {

    List<LedgerEntry> findByJournalId(UUID journalId);

    List<LedgerEntry> findByWalletAccountId(UUID walletAccountId);

    List<LedgerEntry> findByUserId(UUID userId);

    List<LedgerEntry> findByAccountRef(String accountRef);

    List<LedgerEntry> findByCurrency(String currency);

    List<LedgerEntry> findByDirection(LedgerEntryDirection direction);

    List<LedgerEntry> findByEntryType(LedgerEntryType entryType);
}
