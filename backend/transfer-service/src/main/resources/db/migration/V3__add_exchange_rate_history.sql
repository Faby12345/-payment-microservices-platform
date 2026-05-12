-- Create exchange_rate_history table
CREATE TABLE exchange_rate_history (
    id UUID PRIMARY KEY,
    base_currency VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    rate NUMERIC(18, 6) NOT NULL,
    rate_date DATE NOT NULL,
    UNIQUE(base_currency, target_currency, rate_date)
);

CREATE INDEX idx_exchange_rate_history_date ON exchange_rate_history(rate_date);
