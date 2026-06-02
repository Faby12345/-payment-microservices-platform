package app.ledgerservice.repository.specification;

import app.ledgerservice.dto.LedgerJournalSearchRequest;
import app.ledgerservice.entity.LedgerEntry;
import app.ledgerservice.entity.LedgerJournal;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class LedgerJournalSpecification {

    private LedgerJournalSpecification() {
    }

    public static Specification<LedgerJournal> by(LedgerJournalSearchRequest request) {
        return (root, query, criteriaBuilder) -> {
            query.distinct(true);
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            if (request == null) {
                return criteriaBuilder.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
            }

            if (request.transferId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("transferId"), request.transferId()));
            }
            if (request.sourceEventId() != null && !request.sourceEventId().isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("sourceEventId"), request.sourceEventId()));
            }
            if (request.correlationId() != null && !request.correlationId().isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("correlationId"), request.correlationId()));
            }
            if (request.type() != null) {
                predicates.add(criteriaBuilder.equal(root.get("type"), request.type()));
            }
            if (request.status() != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), request.status()));
            }
            if (request.postedFrom() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("postedAt"), request.postedFrom()));
            }
            if (request.postedTo() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("postedAt"), request.postedTo()));
            }

            boolean needsEntryJoin = request.userId() != null
                    || request.walletAccountId() != null
                    || request.currency() != null && !request.currency().isBlank()
                    || request.direction() != null
                    || request.entryType() != null;

            if (needsEntryJoin) {
                Join<LedgerJournal, LedgerEntry> entryJoin = root.join("entries", JoinType.LEFT);
                if (request.userId() != null) {
                    predicates.add(criteriaBuilder.equal(entryJoin.get("userId"), request.userId()));
                }
                if (request.walletAccountId() != null) {
                    predicates.add(criteriaBuilder.equal(entryJoin.get("walletAccountId"), request.walletAccountId()));
                }
                if (request.currency() != null && !request.currency().isBlank()) {
                    predicates.add(criteriaBuilder.equal(entryJoin.get("currency"), request.currency().trim().toUpperCase()));
                }
                if (request.direction() != null) {
                    predicates.add(criteriaBuilder.equal(entryJoin.get("direction"), request.direction()));
                }
                if (request.entryType() != null) {
                    predicates.add(criteriaBuilder.equal(entryJoin.get("entryType"), request.entryType()));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }
}
