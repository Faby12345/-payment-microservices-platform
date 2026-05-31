ALTER TABLE transfers
    ADD COLUMN source_amount NUMERIC(19, 4),
    ADD COLUMN source_currency VARCHAR(3),
    ADD COLUMN target_amount NUMERIC(19, 4),
    ADD COLUMN target_currency VARCHAR(3),
    ADD COLUMN fee_currency VARCHAR(3),
    ADD COLUMN total_debited NUMERIC(19, 4),
    ADD COLUMN exchange_rate NUMERIC(18, 6);

UPDATE transfers
SET source_amount = amount,
    source_currency = currency,
    target_amount = amount,
    target_currency = currency,
    fee_currency = currency,
    total_debited = amount + COALESCE(fee, 0),
    exchange_rate = 1.000000
WHERE source_amount IS NULL;

ALTER TABLE transfers
    ALTER COLUMN source_amount SET NOT NULL,
    ALTER COLUMN source_currency SET NOT NULL,
    ALTER COLUMN target_amount SET NOT NULL,
    ALTER COLUMN target_currency SET NOT NULL;
