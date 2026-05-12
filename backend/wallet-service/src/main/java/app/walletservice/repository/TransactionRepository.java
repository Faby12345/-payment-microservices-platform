package app.walletservice.repository;

import app.walletservice.entity.Transaction;
import jdk.jfr.Registered;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID>, JpaSpecificationExecutor<Transaction> {
    Optional<Transaction> findByIdempotencyKey(String idempotencyKey);
    Optional<Transaction> findByReference(String reference);
    
    List<Transaction> findByFromAccountWalletUserIdOrToAccountWalletUserIdOrderByCreatedAtDesc(UUID fromUserId, UUID toUserId);

    Page<Transaction> findByFromAccountWalletUserIdOrToAccountWalletUserIdOrderByCreatedAtDesc(UUID fromUserId, UUID toUserId, Pageable pageable);
}
