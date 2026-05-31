WITH pairs AS (
    SELECT
        ron_to_currency.id AS ron_to_currency_id,
        currency_to_ron.id AS currency_to_ron_id,
        ron_to_currency.rate AS currency_to_ron_rate,
        currency_to_ron.rate AS ron_to_currency_rate
    FROM exchange_rates ron_to_currency
    JOIN exchange_rates currency_to_ron
        ON currency_to_ron.base_currency = ron_to_currency.target_currency
       AND currency_to_ron.target_currency = 'RON'
    WHERE ron_to_currency.base_currency = 'RON'
      AND ron_to_currency.target_currency <> 'RON'
)
UPDATE exchange_rates er
SET rate = CASE
    WHEN er.id = pairs.ron_to_currency_id THEN pairs.ron_to_currency_rate
    WHEN er.id = pairs.currency_to_ron_id THEN pairs.currency_to_ron_rate
    ELSE er.rate
END
FROM pairs
WHERE er.id IN (pairs.ron_to_currency_id, pairs.currency_to_ron_id);

UPDATE exchange_rate_history
SET base_currency = target_currency,
    target_currency = 'RON'
WHERE base_currency = 'RON'
  AND target_currency <> 'RON';
