package app.walletservice.producer;

import app.walletservice.config.RabbitMQConfig;
import app.walletservice.event.LedgerTransactionSettledEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Slf4j
@Service
@RequiredArgsConstructor
public class LedgerEventProducer {

    private final AmqpTemplate amqpTemplate;

    public void publishTransactionSettledAfterCommit(LedgerTransactionSettledEvent event) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            publishTransactionSettled(event);
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                publishTransactionSettled(event);
            }
        });
    }

    private void publishTransactionSettled(LedgerTransactionSettledEvent event) {
        log.info("Publishing ledger transaction settled event id={} transferId={}",
                event.eventId(), event.transferId());
        amqpTemplate.convertAndSend(
                RabbitMQConfig.WALLET_EVENTS_EXCHANGE,
                RabbitMQConfig.TRANSACTION_SETTLED_ROUTING_KEY,
                event
        );
    }
}
