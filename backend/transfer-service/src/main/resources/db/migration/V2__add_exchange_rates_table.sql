-- Create exchange_rates table for master rates
CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY,
    base_currency VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    rate NUMERIC(18, 6) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    UNIQUE(base_currency, target_currency)
);

-- Performance Index for rate lookups
CREATE INDEX idx_exchange_rates_lookup ON exchange_rates(base_currency, target_currency);
