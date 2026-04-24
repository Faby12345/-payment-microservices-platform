-- Initial Schema Migration
CREATE TABLE wallet (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE account (
    id UUID PRIMARY KEY,
    wallet_id UUID NOT NULL REFERENCES wallet(id),
    currency VARCHAR(3) NOT NULL,
    balance NUMERIC(19, 4) NOT NULL,
    available_balance NUMERIC(19, 4) NOT NULL,
    version BIGINT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    source_currency VARCHAR(3) NOT NULL,
    source_amount NUMERIC(19, 4) NOT NULL,
    destination_currency VARCHAR(3) NOT NULL,
    destination_amount NUMERIC(19, 4) NOT NULL,
    exchange_rate NUMERIC(19, 6),
    from_account_id UUID REFERENCES account(id),
    to_account_id UUID REFERENCES account(id),
    reference VARCHAR(64) NOT NULL UNIQUE,
    description VARCHAR(255),
    idempotency_key VARCHAR(64) UNIQUE,
    metadata JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE transaction_holds (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES account(id),
    amount NUMERIC(19, 4) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    reference VARCHAR(64) UNIQUE,
    idempotency_key VARCHAR(64) UNIQUE,
    transaction_id UUID REFERENCES wallet_transactions(id),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- Performance Indexes
CREATE INDEX idx_wallet_user_id ON wallet(user_id);
CREATE INDEX idx_account_wallet_id ON account(wallet_id);
CREATE INDEX idx_transactions_from_account ON wallet_transactions(from_account_id);
CREATE INDEX idx_transactions_to_account ON wallet_transactions(to_account_id);
CREATE INDEX idx_holds_account_id ON transaction_holds(account_id);
CREATE INDEX idx_holds_expires_at ON transaction_holds(expires_at);
