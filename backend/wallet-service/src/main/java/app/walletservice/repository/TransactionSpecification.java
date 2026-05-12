package app.walletservice.repository;

import app.walletservice.entity.Account;
import app.walletservice.entity.Transaction;
import app.walletservice.entity.TransactionStatus;
import app.walletservice.entity.TransactionType;
import app.walletservice.entity.Wallet;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class TransactionSpecification {

    public static Specification<Transaction> hasUserId(UUID userId) {
        return (root, query, cb) -> {
            // Use LEFT JOINs to avoid excluding transactions where one account is null (e.g. Deposits/Withdrawals)
            Join<Transaction, Account> fromAccountJoin = root.join("fromAccount", JoinType.LEFT);
            Join<Account, Wallet> fromWalletJoin = fromAccountJoin.join("wallet", JoinType.LEFT);
            
            Join<Transaction, Account> toAccountJoin = root.join("toAccount", JoinType.LEFT);
            Join<Account, Wallet> toWalletJoin = toAccountJoin.join("wallet", JoinType.LEFT);

            return cb.or(
                    cb.equal(fromWalletJoin.get("userId"), userId),
                    cb.equal(toWalletJoin.get("userId"), userId)
            );
        };
    }

    public static Specification<Transaction> hasType(TransactionType type) {
        return (root, query, cb) -> type == null ? cb.conjunction() : cb.equal(root.get("type"), type);
    }

    public static Specification<Transaction> hasStatus(TransactionStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }
}
