# Payment Microservices Platform

Payment Microservices Platform is a full-stack financial system built around a microservices backend and a React frontend. It covers user authentication, wallet management, transfers, exchange rates, and ledger accounting, with asynchronous processing for the transaction pipeline.

## Architecture

The system is split into independent services, each with its own responsibility and database.

```text
Frontend (React)
    -> API Gateway
        -> Auth Service
        -> Wallet Service
        -> Transfer Service
        -> Ledger Service

RabbitMQ connects the asynchronous parts of the system.
```

### Core Services

- `api-gateway` - single entry point for the frontend, request routing, and browser CORS.
- `auth-service` - registration, login, refresh tokens, logout, and current-user profile lookup.
- `wallet-service` - wallet/account management, transaction processing, and ledger event publishing.
- `transfer-service` - transfer initiation, transfer persistence, and exchange-rate handling.
- `ledger-service` - immutable accounting journal and ledger entry storage, with admin search endpoints.

### Infrastructure

- PostgreSQL for each service database.
- RabbitMQ for asynchronous events.
- Flyway for database migrations.

## Request Flow

### Authentication

1. The frontend sends login/register requests to the API gateway.
2. The gateway routes the request to `auth-service`.
3. On login, `auth-service` returns:
   - a short-lived access token in the response body
   - a refresh token in an `HttpOnly` cookie
4. The frontend keeps the access token in memory and uses it for API calls.
5. When an access token expires, the frontend calls `/auth/refresh` through the gateway and the refresh cookie is used to obtain a new access token.

### Transfer Pipeline

1. The frontend submits a transfer through the gateway.
2. `transfer-service` validates the request, resolves exchange rates when needed, stores the transfer, and publishes a `TransferCreatedEvent`.
3. `wallet-service` consumes `TransferCreatedEvent`, updates wallet balances and transactions, then publishes a `LedgerTransactionSettledEvent` after the database transaction commits.
4. `ledger-service` consumes `LedgerTransactionSettledEvent`, checks whether the event was already processed, and creates:
   - one `ledger_journal`
   - one or more `ledger_entries`
5. The ledger becomes the audit trail for completed financial activity.

## Ledger Service

The ledger is the accounting read model of the platform.

It is responsible for:

- storing immutable journal records for settled financial events
- storing debit and credit entries per journal
- preventing duplicate processing through source-event deduplication
- exposing admin query endpoints for journals and entries
- supporting search by user, wallet account, transfer, date range, currency, direction, and entry type

Typical usage:

- audit a specific transfer
- inspect all accounting entries for a user
- filter journals by date or status
- verify that a transfer produced balanced ledger entries

## API Gateway

The frontend talks only to the gateway.

Gateway routes:

- `http://localhost:8085/api/v1/auth/**` -> `auth-service` on `8080`
- `http://localhost:8085/api/v1/wallets/**` and `http://localhost:8085/api/v1/transactions/**` -> `wallet-service` on `8081`
- `http://localhost:8085/api/v1/transfers/**` and `http://localhost:8085/api/v1/exchange-rates/**` -> `transfer-service` on `8082`
- `http://localhost:8085/api/v1/ledger/**` -> `ledger-service` on `8083`

Browser CORS is configured only in the gateway.

## Authentication Model

The platform uses a two-token model:

- Access token: short-lived JWT used for API authorization.
- Refresh token: long-lived `HttpOnly` cookie used to renew access tokens.

Why this setup:

- the access token is fast to verify and suitable for stateless API calls
- the refresh token stays out of JavaScript and is safer against client-side token theft
- the frontend can silently renew sessions without forcing a full login

## Async Messaging

RabbitMQ is used to decouple the transaction pipeline:

- `transfer-service` publishes transfer events
- `wallet-service` consumes transfer events and emits ledger settlement events
- `ledger-service` consumes settlement events and persists journals and entries

This gives the platform:

- loose coupling between services
- retry-friendly processing
- an audit trail that is independent from the operational wallet state

## Local Ports

- Frontend: `5173` or `5174`
- API Gateway: `8085`
- Auth Service: `8080`
- Wallet Service: `8081`
- Transfer Service: `8082`
- Ledger Service: `8083`
- RabbitMQ: `5672`
- PostgreSQL auth: `5433`
- PostgreSQL wallet: `5434`
- PostgreSQL transfer: `5435`
- PostgreSQL ledger: `5436`

## Local Setup

1. Start PostgreSQL and RabbitMQ.
2. Start the backend services.
3. Start the API gateway.
4. Start the frontend.

The repository includes separate `mvnw` wrappers per backend service and a Vite frontend app.

## Startup Scripts

The repo includes helper scripts in the root folder for local development:

- `boot-run.sh` starts `auth-service`, `wallet-service`, `transfer-service`, `ledger-service`, and `api-gateway`.
- `boot-stop.sh` stops those backend services and closes the Terminal windows opened by the runner script.

Typical workflow:

```bash
./boot-run.sh
```

When you are done:

```bash
./boot-stop.sh
```

Why this is useful:

- each Spring Boot service runs as a native local process instead of another container layer
- this keeps memory usage lower than running the Java services inside Docker
- it makes local debugging easier because each service has its own terminal and logs
- it fits better with a multi-module development workflow on machines with limited RAM

## Docker

The root `docker-compose.yml` is used for infrastructure:

- PostgreSQL for `auth-service`, `wallet-service`, `transfer-service`, and `ledger-service`
- RabbitMQ with the management UI

Current service containers are intentionally not the default path for local development. The comment in the compose file reflects the same decision: Java services are heavier in Docker, so the recommended setup is to run the backend with `boot-run.sh` and keep Docker focused on the databases and message broker.

If you prefer a fully containerized setup, the compose file can be extended with the service containers, but that is not the default development path in this repository.

## Ledger API

The ledger service exposes read endpoints for admin use:

- `GET /api/v1/ledger/journals`
- `GET /api/v1/ledger/journals/{journalId}`
- `GET /api/v1/ledger/transfers/{transferId}/journals`
- `GET /api/v1/ledger/entries`
- `GET /api/v1/ledger/users/{userId}/entries`
- `GET /api/v1/ledger/accounts/{walletAccountId}/entries`

These endpoints support filtering and pagination.

## Frontend

The React frontend provides:

- authentication screens
- wallet overview and transaction history
- transfer initiation
- exchange-rate views
- ledger audit dashboard for admin users

The frontend calls only the gateway base URL.

## Notes

- Each service owns its own database and migrations.
- The wallet and ledger pipeline is event-driven, so persistence happens across multiple services.
- The ledger is intentionally append-only in normal operation.
- For day-to-day local development, the shell scripts are the preferred way to start and stop the backend stack.
