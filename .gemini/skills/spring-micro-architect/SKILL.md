---
name: spring-micro-architect
description: Generates boilerplate for Spring Boot microservices, REST APIs, and RabbitMQ async integrations. Use this when you need to scaffold a new service, create a new REST controller, or set up messaging queues and bindings.
---

# spring-micro-architect

This skill helps you maintain architectural consistency across the Java/Spring Boot microservices platform.

## Key Features

*   **Microservice Scaffolding:** Standardized `pom.xml` and package structures.
*   **REST Controllers:** Idiomatic controllers with constructor injection and standard response entities.
*   **RabbitMQ Integration:** Consistent configuration for exchanges, queues, and bindings.

## How to Use

### Creating a New Controller

When the user asks to "create a new controller for [Entity]", follow these steps:

1.  Read `assets/controller-template.java`.
2.  Replace placeholders like `${ENTITY_NAME}`, `${SERVICE_NAME}`, and `${ENDPOINT}`.
3.  Write the file to the appropriate `controller` package in the target microservice.

### Setting Up RabbitMQ

When the user asks to "set up a new message queue" or "configure RabbitMQ for [Service]", follow these steps:

1.  Read `assets/rabbitmq-config-template.java`.
2.  Replace placeholders with appropriate names (e.g., `TRANSFER_EXCHANGE`, `WALLET_QUEUE`).
3.  Ensure `spring.rabbitmq` properties are present in `application.properties`.

## Design Patterns

*   **Constructor Injection:** Always use `@RequiredArgsConstructor` for dependency injection.
*   **Layered Architecture:** Follow the Controller -> Service -> Mapper -> Repository pattern.
*   **DTOS:** Never expose entities directly; always use `dto` and `mapper` layers.
