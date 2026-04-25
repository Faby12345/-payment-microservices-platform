package app.walletservice.service.interfaces;

import app.walletservice.entity.Account;
import app.walletservice.entity.TransactionHold;
import app.walletservice.entity.Wallet;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface IWalletService {

    Wallet createWallet(UUID userId, String defaultCurrency);

    Wallet getWalletByUserId(UUID userId);

    Account createAccount(UUID walletId, String currency);

    List<Account> getAccountsByUserId(UUID userId);

    TransactionHold reserveFunds(UUID accountId, BigDecimal amount, String currency, String reference, String idempotencyKey);

    void settleHold(UUID holdId);

    void releaseHold(UUID holdId);

    void creditAccount(UUID accountId, BigDecimal amount, String currency, String reference, String idempotencyKey);
}
