-- Migration to add IBAN to account table
ALTER TABLE account ADD COLUMN iban VARCHAR(34);

-- Populate existing accounts with a dummy IBAN to satisfy NOT NULL and UNIQUE constraints
-- We use a prefix + part of the UUID to ensure uniqueness for existing data
UPDATE account SET iban = 'PT50' || UPPER(REPLACE(SUBSTRING(id::text FROM 1 FOR 20), '-', '')) WHERE iban IS NULL;

-- Now make it NOT NULL and UNIQUE
ALTER TABLE account ALTER COLUMN iban SET NOT NULL;
ALTER TABLE account ADD CONSTRAINT uk_account_iban UNIQUE (iban);
