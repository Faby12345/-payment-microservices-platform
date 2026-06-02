CREATE TABLE ledger_journals (
    id UUID PRIMARY KEY,
    source_service VARCHAR(64) NOT NULL,
    source_event_id VARCHAR(128) NOT NULL,
    correlation_id VARCHAR(128),
    transfer_id UUID,
    type VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    description VARCHAR(255),
    posted_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT uk_ledger_journals_source_event_id UNIQUE (source_event_id)
);

CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY,
    journal_id UUID NOT NULL REFERENCES ledger_journals(id),
    account_ref VARCHAR(128) NOT NULL,
    wallet_account_id UUID,
    user_id UUID,
    currency VARCHAR(3) NOT NULL,
    direction VARCHAR(16) NOT NULL,
    amount NUMERIC(19, 4) NOT NULL,
    entry_type VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE INDEX idx_ledger_journals_transfer_id ON ledger_journals(transfer_id);
CREATE INDEX idx_ledger_journals_correlation_id ON ledger_journals(correlation_id);
CREATE INDEX idx_ledger_journals_type ON ledger_journals(type);
CREATE INDEX idx_ledger_journals_status ON ledger_journals(status);
CREATE INDEX idx_ledger_journals_posted_at ON ledger_journals(posted_at);

CREATE INDEX idx_ledger_entries_journal_id ON ledger_entries(journal_id);
CREATE INDEX idx_ledger_entries_wallet_account_id ON ledger_entries(wallet_account_id);
CREATE INDEX idx_ledger_entries_user_id ON ledger_entries(user_id);
CREATE INDEX idx_ledger_entries_account_ref ON ledger_entries(account_ref);
CREATE INDEX idx_ledger_entries_currency ON ledger_entries(currency);
CREATE INDEX idx_ledger_entries_direction ON ledger_entries(direction);
CREATE INDEX idx_ledger_entries_entry_type ON ledger_entries(entry_type);
