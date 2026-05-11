package app.walletservice.service;

import app.walletservice.entity.*;
import app.walletservice.repository.AccountRepository;
import app.walletservice.repository.TransactionHoldRepository;
import app.walletservice.repository.TransactionRepository;
import app.walletservice.repository.WalletRepository;
import app.walletservice.service.interfaces.IWalletService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
@Slf4j
public class WalletServiceImpl implements IWalletService {

    private static final SecureRandom random = new SecureRandom();

    private final WalletRepository walletRepository;
    private final AccountRepository accountRepository;
    private final TransactionHoldRepository transactionHoldRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    @Override
    public Wallet createWallet(UUID userId, String defaultCurrency) {
        log.info("Creating new wallet for user: {} with currency: {}", userId, defaultCurrency);
        Wallet newWallet = new Wallet(userId, WalletStatus.ACTIVE);
        newWallet = walletRepository.save(newWallet);
        createAccount(newWallet.getId(), defaultCurrency);
        return newWallet;
    }

    @Override
    public Wallet getWalletByUserId(UUID userId) {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for user: " + userId));
    }

    @Transactional
    @Override
    public Account createAccount(UUID walletId, String currency) {
        log.info("Creating new account for wallet: {} with currency: {}", walletId, currency);
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found with id: " + walletId));

        if (currency == null || currency.isBlank()) {
            throw new RuntimeException("Currency is not valid!");
        }

        Account newAccount = new Account(currency, wallet);
        newAccount.setIban(generateIban());
        wallet.addAccount(newAccount);

        return accountRepository.save(newAccount);
    }

    private String generateIban() {
        StringBuilder sb = new StringBuilder("RO99PAYM");
        for (int i = 0; i < 10; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    @Override
    public List<Account> getAccountsByUserId(UUID userId) {
        return accountRepository.findByWalletUserId(userId);
    }

    @Override
    public Account getAccountById(UUID accountId) {
        return accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
    }

    @Transactional
    @Override
    public TransactionHold reserveFunds(UUID accountId, BigDecimal amount,
                                        String currency, String reference,
                                        String description,
                                        String idempotencyKey) {
        log.info("Reserving funds: Account={}, Amount={}, Key={}", accountId, amount, idempotencyKey);

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("account not found!"));

        if(transactionHoldRepository.existsByIdempotencyKey(idempotencyKey)){
            log.warn("Hold already exists for key: {}", idempotencyKey);
            return transactionHoldRepository.findByIdempotencyKey(idempotencyKey).get();
        }

        if (!account.getCurrency().equals(currency)) {
            throw new RuntimeException("Currency mismatch!");
        }

        if(amount.compareTo(BigDecimal.ZERO) <= 0){
            throw new RuntimeException("Amount should be greater than 0!");
        }

        if(account.getAvailableBalance().compareTo(amount) < 0){
            log.error("Insufficient available balance: Account={}, Required={}, Available={}", 
                    accountId, amount, account.getAvailableBalance());
            throw new RuntimeException("Insufficient available balance!");
        }

        account.setAvailableBalance(account.getAvailableBalance().subtract(amount));
        accountRepository.save(account);

        TransactionHold newTransactionHold = new TransactionHold(
                account,
                amount,
                currency,
                TransactionHoldStatus.HELD,
                reference,
                description,
                idempotencyKey);

        return transactionHoldRepository.save(newTransactionHold);
    }

    @Transactional
    @Override
    public void settleHold(UUID holdId) {
        log.info("Settling hold: {}", holdId);
        TransactionHold transactionHold = transactionHoldRepository.findById(holdId)
                .orElseThrow(() -> new RuntimeException("Transaction hold doesn't exist!"));

        if(transactionHold.getStatus() != TransactionHoldStatus.HELD){
            log.warn("Hold {} is in state {}, cannot settle.", holdId, transactionHold.getStatus());
            return;
        }

        Account account = transactionHold.getAccount();
        BigDecimal currentBalance = account.getBalance();
        account.setBalance(currentBalance.subtract(transactionHold.getAmount()));
        accountRepository.save(account);

        transactionHold.setStatus(TransactionHoldStatus.SETTLED);
        transactionHoldRepository.save(transactionHold);

        Transaction transaction = Transaction.builder()
                .fromAccount(account)
                .type(TransactionType.TRANSFER)
                .status(TransactionStatus.COMPLETED)
                .sourceAmount(transactionHold.getAmount())
                .sourceCurrency(transactionHold.getCurrency())
                .destinationAmount(transactionHold.getAmount())
                .destinationCurrency(transactionHold.getCurrency())
                .reference(transactionHold.getReference())
                .description(transactionHold.getDescription())
                .idempotencyKey(transactionHold.getIdempotencyKey())
                .build();

        transactionRepository.save(transaction);
        log.info("Hold {} settled. New balance: {}", holdId, account.getBalance());
    }

    @Transactional
    @Override
    public void releaseHold(UUID holdId) {
        log.info("Releasing hold: {}", holdId);
        TransactionHold transactionHold = transactionHoldRepository.findById(holdId)
                .orElseThrow(() -> new RuntimeException("Transaction hold doesn't exist!"));

        if(transactionHold.getStatus() != TransactionHoldStatus.HELD){
            return;
        }

        Account account = transactionHold.getAccount();
        account.setAvailableBalance(account.getAvailableBalance().add(transactionHold.getAmount()));
        accountRepository.save(account);

        transactionHold.setStatus(TransactionHoldStatus.RELEASED);
        transactionHoldRepository.save(transactionHold);
    }

    @Transactional
    @Override
    public void creditAccount(UUID accountId, BigDecimal amount, String currency, String reference, String description, String idempotencyKey) {
        log.info("Crediting account: Account={}, Amount={}, Key={}", accountId, amount, idempotencyKey);
        
        if (transactionRepository.findByIdempotencyKey(idempotencyKey).isPresent()) {
            log.warn("Transaction already exists for key: {}", idempotencyKey);
            return; 
        }

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found!"));

        if (!account.getCurrency().equals(currency)) {
            log.info("account : " + account.getCurrency() + " " + currency);
            throw new RuntimeException("Currency mismatch!");
        }

        account.setBalance(account.getBalance().add(amount));
        account.setAvailableBalance(account.getAvailableBalance().add(amount));
        accountRepository.save(account);

        Transaction transaction = Transaction.builder()
                .toAccount(account)
                .type(TransactionType.DEPOSIT)
                .status(TransactionStatus.COMPLETED)
                .sourceAmount(amount)
                .sourceCurrency(currency)
                .destinationAmount(amount)
                .destinationCurrency(currency)
                .reference(reference)
                .description(description)
                .idempotencyKey(idempotencyKey)
                .build();

        transactionRepository.save(transaction);
        log.info("Account {} credited. New balance: {}", accountId, account.getBalance());
    }
}
