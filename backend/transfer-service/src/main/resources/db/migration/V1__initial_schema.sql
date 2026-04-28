-- Initial Schema for Transfer Service

CREATE TABLE transfers (
    id UUID PRIMARY KEY,
    from_account_id UUID NOT NULL,
    amount NUMERIC(19, 4) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    fee NUMERIC(19, 4),
    recipient_identifier VARCHAR(255),
    recipient_name VARCHAR(255),
    iban VARCHAR(34),
    bic VARCHAR(11),
    description VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE beneficiaries (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    recipient_identifier VARCHAR(255),
    recipient_name VARCHAR(255),
    iban VARCHAR(34),
    bic VARCHAR(11),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE transfer_status_history (
    id UUID PRIMARY KEY,
    transfer_id UUID NOT NULL REFERENCES transfers(id),
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE exchange_rate_snapshots (
    id UUID PRIMARY KEY,
    transfer_id UUID NOT NULL UNIQUE REFERENCES transfers(id),
    base_currency VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    rate NUMERIC(19, 6) NOT NULL,
    expiry_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- Performance Indexes
CREATE INDEX idx_transfers_from_account ON transfers(from_account_id);
CREATE INDEX idx_beneficiaries_owner ON beneficiaries(owner_id);
CREATE INDEX idx_status_history_transfer ON transfer_status_history(transfer_id);
