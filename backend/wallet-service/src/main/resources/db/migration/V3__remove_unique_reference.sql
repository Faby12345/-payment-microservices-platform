-- Add description column to transaction_holds
-- Keep reference unique for auditing (we will store the Transfer UUID there)

ALTER TABLE transaction_holds ADD COLUMN description VARCHAR(255);
