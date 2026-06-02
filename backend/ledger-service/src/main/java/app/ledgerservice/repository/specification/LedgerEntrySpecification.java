package app.ledgerservice.repository.specification;

import app.ledgerservice.dto.LedgerEntrySearchRequest;
import app.ledgerservice.entity.LedgerEntry;
import app.ledgerservice.entity.LedgerJournal;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class LedgerEntrySpecification {

    private LedgerEntrySpecification() {
    }

    public static Specification<LedgerEntry> by(LedgerEntrySearchRequest request) {
        return (root, query, criteriaBuilder) -> {
            query.distinct(true);
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            if (request == null) {
                return criteriaBuilder.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
            }

            Join<LedgerEntry, LedgerJournal> journalJoin = root.join("journal", JoinType.LEFT);

            if (request.journalId() != null) {
                predicates.add(criteriaBuilder.equal(journalJoin.get("id"), request.journalId()));
            }
            if (request.userId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("userId"), request.userId()));
            }
            if (request.walletAccountId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("walletAccountId"), request.walletAccountId()));
            }
            if (request.transferId() != null) {
                predicates.add(criteriaBuilder.equal(journalJoin.get("transferId"), request.transferId()));
            }
            if (request.accountRef() != null && !request.accountRef().isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("accountRef"), request.accountRef()));
            }
            if (request.currency() != null && !request.currency().isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("currency"), request.currency().trim().toUpperCase()));
            }
            if (request.direction() != null) {
                predicates.add(criteriaBuilder.equal(root.get("direction"), request.direction()));
            }
            if (request.entryType() != null) {
                predicates.add(criteriaBuilder.equal(root.get("entryType"), request.entryType()));
            }
            if (request.journalType() != null) {
                predicates.add(criteriaBuilder.equal(journalJoin.get("type"), request.journalType()));
            }
            if (request.journalStatus() != null) {
                predicates.add(criteriaBuilder.equal(journalJoin.get("status"), request.journalStatus()));
            }
            if (request.postedFrom() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(journalJoin.get("postedAt"), request.postedFrom()));
            }
            if (request.postedTo() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(journalJoin.get("postedAt"), request.postedTo()));
            }

            return criteriaBuilder.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }
}
