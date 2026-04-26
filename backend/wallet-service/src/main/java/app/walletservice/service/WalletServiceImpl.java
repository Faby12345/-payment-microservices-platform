package app.walletservice.service;

import app.walletservice.entity.*;
import app.walletservice.repository.AccountRepository;
import app.walletservice.repository.TransactionHoldRepository;
import app.walletservice.repository.TransactionRepository;
import app.walletservice.repository.WalletRepository;
import app.walletservice.service.interfaces.IWalletService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class WalletServiceImpl implements IWalletService {

    private static final SecureRandom random = new SecureRandom();

    private final WalletRepository walletRepository;
    private final AccountRepository accountRepository;
    private final TransactionHoldRepository transactionHoldRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    @Override
    public Wallet createWallet(UUID userId, String defaultCurrency) {

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
        // Simplified Platform IBAN format:
        // DE (Country) + 99 (Check) + PAYM (Bank) + 10 random digits
        StringBuilder sb = new StringBuilder("DE99PAYM");
        for (int i = 0; i < 10; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    @Override
    public List<Account> getAccountsByUserId(UUID userId) {
        return accountRepository.findByWalletUserId(userId);
    }

    @Transactional
    @Override
    public TransactionHold reserveFunds(UUID accountId, BigDecimal amount,
                                        String currency, String reference,
                                        String idempotencyKey) {

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("account not found!"));

        if(transactionHoldRepository.existsByIdempotencyKey(idempotencyKey)){
            throw new RuntimeException("Transaction amount is already hold!");
        }

        if (!account.getCurrency().equals(currency)) {
            throw new RuntimeException("Currency mismatch!");
        }

        if(amount.compareTo(BigDecimal.ZERO) <= 0){
            throw new RuntimeException("Amount should be grated than 0!");
        }

        if(account.getAvailableBalance().compareTo(amount) < 0){
            throw new RuntimeException("The amount requested is grater then available balance!");
        }


        account.setAvailableBalance(account.getAvailableBalance().subtract(amount));
        accountRepository.save(account);


        TransactionHold newTransactionHold = new TransactionHold(
                account,
                amount,
                currency,
                TransactionHoldStatus.HELD,
                reference,
                idempotencyKey);

        return transactionHoldRepository.save(newTransactionHold);


    }

    @Transactional
    @Override
    public void settleHold(UUID holdId) {
        TransactionHold transactionHold = transactionHoldRepository.findById(holdId)
                .orElseThrow(() -> new RuntimeException("Transaction hold dosen t exists!"));

        if(transactionHold.getStatus() != TransactionHoldStatus.HELD){
            throw new RuntimeException("Hold cannot be settled because it is " + transactionHold.getStatus());
        }

        Account account = transactionHold.getAccount();

        account.setBalance(account.getBalance().subtract(transactionHold.getAmount()));
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
                    .idempotencyKey(transactionHold.getIdempotencyKey())
                   .build();

        transactionRepository.save(transaction);
    }

    @Transactional
    @Override
    public void releaseHold(UUID holdId) {
        TransactionHold transactionHold = transactionHoldRepository.findById(holdId)
                .orElseThrow(() -> new RuntimeException("Transaction hold dosen t exists!"));

        if(transactionHold.getStatus() != TransactionHoldStatus.HELD){
            throw new RuntimeException("Hold cannot be released because it is " + transactionHold.getStatus());
        }

        Account account = transactionHold.getAccount();

        account.setAvailableBalance(account.getAvailableBalance().add(transactionHold.getAmount()));
        accountRepository.save(account);


        transactionHold.setStatus(TransactionHoldStatus.RELEASED);
        transactionHoldRepository.save(transactionHold);
    }

    @Transactional
    @Override
    public void creditAccount(UUID accountId, BigDecimal amount, String currency, String reference, String idempotencyKey) {
        if (transactionRepository.findByIdempotencyKey(idempotencyKey).isPresent()) {
            return; //  already processed
        }

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found!"));

        if (!account.getCurrency().equals(currency)) {
            throw new RuntimeException("Currency mismatch!");
        }

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Amount must be greater than zero!");
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
                .idempotencyKey(idempotencyKey)
                .build();

        transactionRepository.save(transaction);
    }
}
