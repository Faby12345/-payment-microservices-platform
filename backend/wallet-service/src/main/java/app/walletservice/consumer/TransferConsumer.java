package app.walletservice.consumer;

import app.walletservice.config.RabbitMQConfig;
import app.walletservice.event.TransferCreatedEvent;
import app.walletservice.service.interfaces.IWalletService;
import lombok.AllArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class TransferConsumer {
    private final IWalletService walletService;

    @RabbitListener(queues = RabbitMQConfig.WALLET_TRANSFER_QUEUE)
    public void handleTransferCreated(TransferCreatedEvent event){
        walletService.processTransfer(event);
    }
}
