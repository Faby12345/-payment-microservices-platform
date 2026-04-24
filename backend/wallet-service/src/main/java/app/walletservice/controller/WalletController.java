package app.walletservice.controller;

import app.walletservice.dto.CreateWalletRequest;
import app.walletservice.dto.WalletResponse;
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
    public ResponseEntity<WalletResponse> getWallet(@org.springframework.web.bind.annotation.PathVariable java.util.UUID userId) {
        Wallet wallet = walletService.getWalletByUserId(userId);
        return ResponseEntity.ok(walletMapper.toResponse(wallet));
    }
}
