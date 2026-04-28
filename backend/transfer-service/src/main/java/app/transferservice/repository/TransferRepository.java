package app.transferservice.repository;

import app.transferservice.model.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, UUID> {
    List<Transfer> findByFromAccountId(UUID fromAccountId);
}
