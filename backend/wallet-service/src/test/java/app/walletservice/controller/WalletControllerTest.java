package app.walletservice.controller;

import app.walletservice.dto.CreateWalletRequest;
import app.walletservice.repository.WalletRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.test.context.ActiveProfiles("test")
@Transactional
class WalletControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private WalletRepository walletRepository;

    @Test
    void shouldCreateWalletWithDefaultAccount() throws Exception {
        // Given
        UUID userId = UUID.randomUUID();
        CreateWalletRequest request = new CreateWalletRequest(userId, "EUR");

        // When & Then
        mockMvc.perform(post("/api/v1/wallets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(userId.toString()))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.accounts", hasSize(1)))
                .andExpect(jsonPath("$.accounts[0].currency").value("EUR"))
                .andExpect(jsonPath("$.accounts[0].balance").value(0));
        
        // Extra verification: Check the DB
        assert walletRepository.findByUserId(userId).isPresent();
    }

    @Test
    void shouldGetWalletByUserId() throws Exception {
        // Given
        UUID userId = UUID.randomUUID();
        app.walletservice.entity.Wallet wallet = new app.walletservice.entity.Wallet(userId, app.walletservice.entity.WalletStatus.ACTIVE);
        app.walletservice.entity.Account account = new app.walletservice.entity.Account("USD", wallet);
        wallet.addAccount(account);
        walletRepository.save(wallet);

        // When & Then
        mockMvc.perform(get("/api/v1/wallets/user/{userId}", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(userId.toString()))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.accounts", hasSize(1)))
                .andExpect(jsonPath("$.accounts[0].currency").value("USD"))
                .andExpect(jsonPath("$.accounts[0].balance").value(0.0));
    }
}
