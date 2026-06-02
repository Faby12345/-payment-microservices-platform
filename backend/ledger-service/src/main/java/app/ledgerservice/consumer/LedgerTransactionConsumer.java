package app.ledgerservice.consumer;

import app.ledgerservice.config.RabbitMQConfig;
import app.ledgerservice.event.LedgerTransactionSettledEvent;
import app.ledgerservice.service.interfaces.ILedgerJournalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class LedgerTransactionConsumer {

    private final ILedgerJournalService ledgerJournalService;

    @RabbitListener(queues = RabbitMQConfig.LEDGER_TRANSACTION_SETTLED_QUEUE)
    public void handleTransactionSettled(LedgerTransactionSettledEvent event) {
        log.info("Received ledger transaction settled event id={}", event.eventId());
        ledgerJournalService.postTransactionSettled(event);
    }
}
