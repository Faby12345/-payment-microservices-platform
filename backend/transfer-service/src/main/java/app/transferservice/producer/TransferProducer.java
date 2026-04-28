package app.transferservice.producer;

import app.transferservice.config.RabbitMQConfig;
import app.transferservice.event.TransferCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransferProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendTransferCreatedEvent(TransferCreatedEvent event) {
        log.info("Sending TransferCreatedEvent to RabbitMQ: {}", event);
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.TRANSFER_EXCHANGE,
                RabbitMQConfig.TRANSFER_CREATED_ROUTING_KEY,
                event
        );
    }
}
