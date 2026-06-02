package app.ledgerservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String WALLET_EVENTS_EXCHANGE = "wallet.events.exchange";
    public static final String LEDGER_TRANSACTION_SETTLED_QUEUE = "ledger.transaction-settled.queue";
    public static final String TRANSACTION_SETTLED_ROUTING_KEY = "wallet.transaction.settled";

    @Bean
    public TopicExchange walletEventsExchange() {
        return new TopicExchange(WALLET_EVENTS_EXCHANGE);
    }

    @Bean
    public Queue ledgerTransactionSettledQueue() {
        return new Queue(LEDGER_TRANSACTION_SETTLED_QUEUE, true);
    }

    @Bean
    public Binding ledgerTransactionSettledBinding() {
        return BindingBuilder
                .bind(ledgerTransactionSettledQueue())
                .to(walletEventsExchange())
                .with(TRANSACTION_SETTLED_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            MessageConverter jsonMessageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jsonMessageConverter);
        return factory;
    }
}
