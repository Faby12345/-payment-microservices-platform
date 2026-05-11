package app.transferservice.client;

import app.transferservice.dto.AccountResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class WalletClient {

    private final RestTemplate restTemplate;

    @Value("${app.services.wallet.url:http://localhost:8081}")
    private String walletServiceUrl;

    public AccountResponse getAccountDetails(UUID accountId) {
        String url = String.format("%s/api/v1/wallets/accounts/%s", walletServiceUrl, accountId);
        log.info("Calling Wallet Service to get account details: {}", url);
        try {
            return restTemplate.getForObject(url, AccountResponse.class);
        } catch (Exception e) {
            log.error("Failed to fetch account details from Wallet Service: {}", e.getMessage());
            throw new RuntimeException("Could not verify source account details. Please try again later.");
        }
    }
}
