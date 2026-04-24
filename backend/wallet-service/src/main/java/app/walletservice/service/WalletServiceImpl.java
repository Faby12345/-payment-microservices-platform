package app.walletservice.service;

import app.walletservice.entity.*;
import app.walletservice.repository.AccountRepository;
import app.walletservice.repository.TransactionHoldRepository;
import app.walletservice.repository.WalletRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class WalletServiceImpl implements IWalletService {

    private final WalletRepository walletRepository;
    private final AccountRepository accountRepository;
    private final TransactionHoldRepository transactionHoldRepository;

    @Transactional
    @Override
    public Wallet createWallet(UUID userId, String defaultCurrency) {

        Wallet newWallet = new Wallet(userId, WalletStatus.ACTIVE);
        newWallet = walletRepository.save(newWallet);

        createAccount(newWallet.getId(), defaultCurrency);

        return newWallet;
    }

    @Transactional
    @Override
    public Account createAccount(UUID walletId, String currency) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found with id: " + walletId));

        // Simple validation for now
        if (currency == null || currency.isBlank()) {
            throw new RuntimeException("Currency is not valid!");
        }

        Account newAccount = new Account(currency, wallet);
        

        wallet.addAccount(newAccount);

        return accountRepository.save(newAccount);
    }

    @Override
    public List<Account> getAccountsByUserId(UUID userId) {
        return accountRepository.findByWalletUserId(userId);
    }

    @Transactional
    @Override
    public TransactionHold reserveFunds(UUID accountId, BigDecimal amount, String currency, String reference, String idempotencyKey) {

        return null;
    }

    @Transactional
    @Override
    public void settleHold(UUID holdId) {

    }

    @Transactional
    @Override
    public void releaseHold(UUID holdId) {

    }
}
