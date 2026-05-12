package app.transferservice.controller;

import app.transferservice.dto.exchange.ExchangeRateHistoryResponse;
import app.transferservice.dto.exchange.ExchangeRateResponse;
import app.transferservice.dto.exchange.ManualRateUpdateRequest;
import app.transferservice.model.ExchangeRate;
import app.transferservice.model.ExchangeRateHistory;
import app.transferservice.service.interfaces.IExchangeRateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/exchange-rates")
@RequiredArgsConstructor
public class ExchangeRateController {

    private final IExchangeRateService exchangeRateService;

    @GetMapping("/current")
    public ResponseEntity<List<ExchangeRateResponse>> getAllCurrentRates() {
        List<ExchangeRateResponse> responses = exchangeRateService.getAllCurrentRates().stream()
                .map(this::mapToResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/current/{base}/{target}")
    public ResponseEntity<ExchangeRateResponse> getRate(
            @PathVariable String base,
            @PathVariable String target) {
        return exchangeRateService.getRate(base, target)
                .map(rate -> ResponseEntity.ok(mapToResponse(rate)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/history/{date}")
    public ResponseEntity<List<ExchangeRateHistoryResponse>> getHistoryByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<ExchangeRateHistoryResponse> responses = exchangeRateService.getHistoryByDate(date).stream()
                .map(this::mapToHistoryResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/sync")
    public ResponseEntity<Void> triggerSync() {
        exchangeRateService.fetchAndProcessRates();
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/manual")
    public ResponseEntity<Void> updateRate(@Valid @RequestBody ManualRateUpdateRequest request) {
        exchangeRateService.updateRate(
                request.getBaseCurrency(),
                request.getTargetCurrency(),
                request.getRate()
        );
        return ResponseEntity.ok().build();
    }

    private ExchangeRateResponse mapToResponse(ExchangeRate entity) {
        return ExchangeRateResponse.builder()
                .baseCurrency(entity.getBaseCurrency())
                .targetCurrency(entity.getTargetCurrency())
                .rate(entity.getRate())
                .lastUpdated(entity.getUpdatedAt())
                .build();
    }

    private ExchangeRateHistoryResponse mapToHistoryResponse(ExchangeRateHistory entity) {
        return ExchangeRateHistoryResponse.builder()
                .baseCurrency(entity.getBaseCurrency())
                .targetCurrency(entity.getTargetCurrency())
                .rate(entity.getRate())
                .rateDate(entity.getRateDate())
                .build();
    }
}
