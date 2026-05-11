package app.walletservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String TRANSFER_EXCHANGE = "transfer.exchange";
    public static final String WALLET_TRANSFER_QUEUE = "wallet.transfer.queue";
    public static final String TRANSFER_CREATED_ROUTING_KEY = "transfer.created";

    @Bean
    public TopicExchange transferExchange() {
        return new TopicExchange(TRANSFER_EXCHANGE);
    }

    @Bean
    public Queue walletTransferQueue() {
        return new Queue(WALLET_TRANSFER_QUEUE, true);
    }

    @Bean
    public Binding binding() {
        return BindingBuilder
                .bind(walletTransferQueue())
                .to(transferExchange())
                .with(TRANSFER_CREATED_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
        final RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}
