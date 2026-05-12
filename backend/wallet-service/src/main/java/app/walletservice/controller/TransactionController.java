package app.walletservice.controller;

import app.walletservice.dto.TransactionResponse;
import app.walletservice.dto.TransferRequest;
import app.walletservice.service.interfaces.ITransactionService;
import lombok.RequiredArgsConstructor;
import app.walletservice.entity.TransactionStatus;
import app.walletservice.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final ITransactionService transactionService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<TransactionResponse>> getTransactionsByUserId(
            @PathVariable UUID userId,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) TransactionStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(transactionService.getTransactionsByUserId(userId, type, status, pageable));
    }

    @GetMapping("/user/{userId}/all")
    public ResponseEntity<List<TransactionResponse>> getAllTransactionsByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(transactionService.getTransactionsByUserId(userId));
    }

    @PostMapping("/transfer")
    public ResponseEntity<Void> processTransfer(@RequestBody TransferRequest request) {
        transactionService.processTransfer(request);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
