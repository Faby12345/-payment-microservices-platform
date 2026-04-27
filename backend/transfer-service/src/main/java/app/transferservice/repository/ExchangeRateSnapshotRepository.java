package app.transferservice.repository;

import app.transferservice.model.ExchangeRateSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExchangeRateSnapshotRepository extends JpaRepository<ExchangeRateSnapshot, UUID> {
    Optional<ExchangeRateSnapshot> findByTransferId(UUID transferId);
}
