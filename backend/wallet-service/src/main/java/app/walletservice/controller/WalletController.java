package app.walletservice.controller;

import app.walletservice.dto.AccountResponse;
import app.walletservice.dto.CreateAccountRequest;
import app.walletservice.dto.CreateWalletRequest;
import app.walletservice.dto.WalletResponse;
import app.walletservice.entity.Account;
import app.walletservice.entity.Wallet;
import app.walletservice.mapper.WalletMapper;
import app.walletservice.service.interfaces.IWalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.UUID;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/v1/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final IWalletService walletService;
    private final WalletMapper walletMapper;

    @PostMapping
    public ResponseEntity<WalletResponse> createWallet(@RequestBody CreateWalletRequest request) {
        Wallet wallet = walletService.createWallet(request.getUserId(), request.getDefaultCurrency());
        return new ResponseEntity<>(walletMapper.toResponse(wallet), HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<WalletResponse> getWallet(@PathVariable UUID userId) {
        Wallet wallet = walletService.getWalletByUserId(userId);
        return ResponseEntity.ok(walletMapper.toResponse(wallet));
    }

    @GetMapping("/accounts/{accountId}")
    public ResponseEntity<AccountResponse> getAccount(@PathVariable UUID accountId) {
        Account account = walletService.getAccountById(accountId);
        return ResponseEntity.ok(walletMapper.toAccountResponse(account));
    }

    @PostMapping("/{walletId}/accounts")
    public ResponseEntity<AccountResponse> addAccount(
            @PathVariable UUID walletId,
            @RequestBody CreateAccountRequest request) {
        Account account = walletService.createAccount(walletId, request.getCurrency());
        return new ResponseEntity<>(walletMapper.toAccountResponse(account), HttpStatus.CREATED);
    }
}
