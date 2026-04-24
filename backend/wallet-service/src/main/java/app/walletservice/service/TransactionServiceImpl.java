package app.walletservice.service;

import app.walletservice.dto.TransactionResponse;
import app.walletservice.mapper.TransactionMapper;
import app.walletservice.repository.TransactionRepository;
import app.walletservice.service.interfaces.ITransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements ITransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;

    @Override
    public List<TransactionResponse> getTransactionsByUserId(UUID userId) {
        return transactionMapper.toResponseList(
                transactionRepository.findByFromAccountWalletUserIdOrToAccountWalletUserIdOrderByCreatedAtDesc(userId, userId)
        );
    }
}
