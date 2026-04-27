package app.transferservice.controller;

import app.transferservice.dto.TransferRequest;
import app.transferservice.dto.TransferResponse;
import app.transferservice.service.interfaces.TransferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;

    @PostMapping
    public ResponseEntity<TransferResponse> initiateTransfer(@Valid @RequestBody TransferRequest request) {
        log.info("REST request to initiate transfer from account: {}", request.fromAccountId());
        TransferResponse response = transferService.initiateTransfer(request);
        return ResponseEntity.ok(response);
    }
}
