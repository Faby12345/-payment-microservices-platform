package app.walletservice.controller;

import app.walletservice.dto.TransferRequest;
import app.walletservice.entity.Account;
import app.walletservice.entity.Wallet;
import app.walletservice.entity.WalletStatus;
import app.walletservice.repository.AccountRepository;
import app.walletservice.repository.TransactionRepository;
import app.walletservice.repository.WalletRepository;
import app.walletservice.service.interfaces.IWalletService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private IWalletService walletService;

    @Test
    void shouldPerformSuccessfulTransfer() throws Exception {
        // Given: Two wallets with accounts
        UUID user1Id = UUID.randomUUID();
        Wallet wallet1 = new Wallet(user1Id, WalletStatus.ACTIVE);
        Account account1 = new Account("USD", wallet1);
        wallet1.addAccount(account1);
        walletRepository.save(wallet1);

        UUID user2Id = UUID.randomUUID();
        Wallet wallet2 = new Wallet(user2Id, WalletStatus.ACTIVE);
        Account account2 = new Account("USD", wallet2);
        wallet2.addAccount(account2);
        walletRepository.save(wallet2);

        // Give User 1 some initial money ($100)
        walletService.creditAccount(account1.getId(), new BigDecimal("100.00"), "USD", "Initial Deposit", "initial_dep_1");

        // Verify initial state
        Account savedAccount1 = accountRepository.findById(account1.getId()).get();
        assertEquals(0, new BigDecimal("100.0000").compareTo(savedAccount1.getBalance()));

        // Prepare Transfer Request: $40.00 from Account 1 to Account 2
        TransferRequest request = new TransferRequest(
                account1.getId(),
                account2.getId(),
                new BigDecimal("40.00"),
                "USD",
                "Payment for services",
                "unique_transfer_123"
        );

        // When
        mockMvc.perform(post("/api/v1/transactions/transfer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Then: Verify Balances
        Account finalAccount1 = accountRepository.findById(account1.getId()).get();
        Account finalAccount2 = accountRepository.findById(account2.getId()).get();

        // Account 1: 100 - 40 = 60
        assertEquals(0, new BigDecimal("60.0000").compareTo(finalAccount1.getBalance()));
        assertEquals(0, new BigDecimal("60.0000").compareTo(finalAccount1.getAvailableBalance()));

        // Account 2: 0 + 40 = 40
        assertEquals(0, new BigDecimal("40.0000").compareTo(finalAccount2.getBalance()));
        assertEquals(0, new BigDecimal("40.0000").compareTo(finalAccount2.getAvailableBalance()));

        // Verify Transactions exist in DB (1 credit, 1 debit/transfer)
        // Note: we have initial deposit (1) + transfer debit (1) + transfer credit (1) = 3 total
        long count = transactionRepository.count();
        assertEquals(3, count);
    }

    @Test
    void shouldFailTransferWhenInsufficientFunds() throws Exception {
        // Given: Two wallets with accounts
        UUID user1Id = UUID.randomUUID();
        Wallet wallet1 = new Wallet(user1Id, WalletStatus.ACTIVE);
        Account account1 = new Account("USD", wallet1);
        wallet1.addAccount(account1);
        walletRepository.save(wallet1);

        UUID user2Id = UUID.randomUUID();
        Wallet wallet2 = new Wallet(user2Id, WalletStatus.ACTIVE);
        Account account2 = new Account("USD", wallet2);
        wallet2.addAccount(account2);
        walletRepository.save(wallet2);

        // User 1 has only $10
        walletService.creditAccount(account1.getId(), new BigDecimal("10.00"), "USD", "Initial Deposit", "initial_dep_2");

        // Try to transfer $40.00
        TransferRequest request = new TransferRequest(
                account1.getId(),
                account2.getId(),
                new BigDecimal("40.00"),
                "USD",
                "Payment for services",
                "unique_transfer_456"
        );

        // When & Then: The service throws RuntimeException which results in 500 error
        try {
            mockMvc.perform(post("/api/v1/transactions/transfer")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isInternalServerError());
        } catch (jakarta.servlet.ServletException e) {
            assertEquals("The amount requested is grater then available balance!", e.getRootCause().getMessage());
        }

        // Verify Balances remained unchanged (except initial deposit)
        Account finalAccount1 = accountRepository.findById(account1.getId()).get();
        assertEquals(0, new BigDecimal("10.0000").compareTo(finalAccount1.getBalance()));
    }

    @Test
    void shouldBeIdempotentWhenProcessingSameTransferTwice() throws Exception {
        // Given: Two wallets with accounts
        UUID user1Id = UUID.randomUUID();
        Wallet wallet1 = new Wallet(user1Id, WalletStatus.ACTIVE);
        Account account1 = new Account("USD", wallet1);
        wallet1.addAccount(account1);
        walletRepository.save(wallet1);

        UUID user2Id = UUID.randomUUID();
        Wallet wallet2 = new Wallet(user2Id, WalletStatus.ACTIVE);
        Account account2 = new Account("USD", wallet2);
        wallet2.addAccount(account2);
        walletRepository.save(wallet2);

        // Give User 1 some money ($100)
        walletService.creditAccount(account1.getId(), new BigDecimal("100.00"), "USD", "Initial Deposit", "idemp_dep_1");

        TransferRequest request = new TransferRequest(
                account1.getId(),
                account2.getId(),
                new BigDecimal("40.00"),
                "USD",
                "Idempotent Payment",
                "same_key_123"
        );

        // When: First call
        mockMvc.perform(post("/api/v1/transactions/transfer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Then: Second call with SAME request
        // Current implementation throws RuntimeException which results in 500, 
        // but the important thing is that balances are NOT deducted again.
        try {
            mockMvc.perform(post("/api/v1/transactions/transfer")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isInternalServerError());
        } catch (jakarta.servlet.ServletException e) {
            assertEquals("Transaction amount is already hold!", e.getRootCause().getMessage());
        }

        // Verify Balances: Should still be 60 and 40 (only one transfer processed)
        Account finalAccount1 = accountRepository.findById(account1.getId()).get();
        Account finalAccount2 = accountRepository.findById(account2.getId()).get();

        assertEquals(0, new BigDecimal("60.0000").compareTo(finalAccount1.getBalance()), "Sender balance should only be deducted once");
        assertEquals(0, new BigDecimal("40.0000").compareTo(finalAccount2.getBalance()), "Receiver balance should only be credited once");

        // Verify Transaction count: 1 (dep) + 1 (debit) + 1 (credit) = 3 total
        assertEquals(3, transactionRepository.count());
    }
}
