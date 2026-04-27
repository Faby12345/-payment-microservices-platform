package app.transferservice.service;

import app.transferservice.dto.TransferRequest;
import app.transferservice.dto.TransferResponse;
import app.transferservice.event.TransferCreatedEvent;
import app.transferservice.model.Transfer;
import app.transferservice.model.enums.TransactionStatus;
import app.transferservice.model.enums.TransferType;
import app.transferservice.producer.TransferProducer;
import app.transferservice.repository.TransferRepository;
import app.transferservice.service.interfaces.TransferService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@AllArgsConstructor
@Slf4j
public class TransferServiceImpl implements TransferService {
    private final TransferRepository transferRepository;
    private final TransferProducer transferProducer;

    @Override
    @Transactional
    public TransferResponse initiateTransfer(TransferRequest request) {
        log.info("Initiating transfer request: {}", request);


        BigDecimal feePercent = (request.type() == TransferType.EXTERNAL) 
                ? new BigDecimal("0.025") // 2.5% for IBAN
                : new BigDecimal("0.01");  // 1.0% for Friends

        BigDecimal fee = request.amount().multiply(feePercent);
        BigDecimal total = request.amount().add(fee);


        Transfer transfer = Transfer.builder()
                .fromAccountId(request.fromAccountId())
                .amount(request.amount())
                .currency(request.currency())
                .type(request.type())
                .status(TransactionStatus.PENDING)
                .fee(fee)
                .recipientIdentifier(request.recipientIdentifier())
                .recipientName(request.recipientName())
                .iban(request.iban())
                .bic(request.bic())
                .description(request.description())
                .build();

        Transfer savedTransfer = transferRepository.save(transfer);


        TransferCreatedEvent event = new TransferCreatedEvent(
                savedTransfer.getId(),
                savedTransfer.getFromAccountId(),
                savedTransfer.getAmount(),
                savedTransfer.getCurrency(),
                savedTransfer.getType(),
                savedTransfer.getRecipientIdentifier()
        );

        transferProducer.sendTransferCreatedEvent(event);


        return TransferResponse.builder()
                .transactionId(savedTransfer.getId())
                .status(savedTransfer.getStatus())
                .amount(savedTransfer.getAmount())
                .fee(savedTransfer.getFee())
                .totalDeducted(total)
                .currency(savedTransfer.getCurrency())
                .timestamp(LocalDateTime.now())
                .message("Transfer initiated successfully and is being processed.")
                .estimatedDelivery(request.type() == TransferType.INTERNAL ? "Instant" : "1-2 Business Days")
                .build();
    }
}
