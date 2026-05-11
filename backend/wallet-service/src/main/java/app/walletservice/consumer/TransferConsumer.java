package app.walletservice.consumer;

import app.walletservice.config.RabbitMQConfig;
import app.walletservice.event.TransferCreatedEvent;
import app.walletservice.service.interfaces.ITransactionService;
import app.walletservice.service.interfaces.IWalletService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
@Slf4j
public class TransferConsumer {
    private final ITransactionService transactionService;

    @RabbitListener(queues = RabbitMQConfig.WALLET_TRANSFER_QUEUE)
    public void handleTransferCreated(TransferCreatedEvent event){
        log.info("Received TransferCreatedEvent for transfer: {}", event.transferId());
        try {
            transactionService.processTransferFromEvent(event);
            log.info("Successfully processed transfer: {}", event.transferId());
        } catch (Exception e) {
            log.error("Failed to process transfer: {}. Error: {}", event.transferId(), e.getMessage());
            throw e;
        }

    }
}