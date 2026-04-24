package app.walletservice.repository;

import app.walletservice.entity.TransactionHold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionHoldRepository extends JpaRepository<TransactionHold, UUID> {
    Optional<TransactionHold> findByIdempotencyKey(String idempotencyKey);
    Optional<TransactionHold> findByReference(String reference);
}
