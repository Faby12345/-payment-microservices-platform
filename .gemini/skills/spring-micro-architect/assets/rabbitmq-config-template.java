package app.${SERVICE_NAME}.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String ${EXCHANGE_NAME_UPPER}_EXCHANGE = "${exchange.name}";
    public static final String ${QUEUE_NAME_UPPER}_QUEUE = "${queue.name}";
    public static final String ${ROUTING_KEY_NAME_UPPER}_ROUTING_KEY = "${routing.key}";

    @Bean
    public TopicExchange ${EXCHANGE_VAR}Exchange() {
        return new TopicExchange(${EXCHANGE_NAME_UPPER}_EXCHANGE);
    }

    @Bean
    public Queue ${QUEUE_VAR}Queue() {
        return new Queue(${QUEUE_NAME_UPPER}_QUEUE, true);
    }

    @Bean
    public Binding ${BINDING_VAR}Binding() {
        return BindingBuilder
                .bind(${QUEUE_VAR}Queue())
                .to(${EXCHANGE_VAR}Exchange())
                .with(${ROUTING_KEY_NAME_UPPER}_ROUTING_KEY);
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
