package app.walletservice.mapper;

import app.walletservice.dto.TransactionResponse;
import app.walletservice.entity.Transaction;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TransactionMapper {

    public TransactionResponse toResponse(Transaction transaction) {
        if (transaction == null) {
            return null;
        }

        return TransactionResponse.builder()
                .id(transaction.getId())
                .type(transaction.getType().name())
                .status(transaction.getStatus().name())
                .sourceCurrency(transaction.getSourceCurrency())
                .sourceAmount(transaction.getSourceAmount())
                .destinationCurrency(transaction.getDestinationCurrency())
                .destinationAmount(transaction.getDestinationAmount())
                .description(transaction.getDescription())
                .reference(transaction.getReference())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    public List<TransactionResponse> toResponseList(List<Transaction> transactions) {
        if (transactions == null) {
            return null;
        }
        return transactions.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
