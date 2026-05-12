-- Seed mock exchange rate history for the last 10 days
-- Note: Using gen_random_uuid() for PostgreSQL

INSERT INTO exchange_rate_history (id, base_currency, target_currency, rate, rate_date)
VALUES 
-- EUR Trends (Slightly Up)
(gen_random_uuid(), 'RON', 'EUR', 4.9750, CURRENT_DATE - INTERVAL '10 days'),
(gen_random_uuid(), 'RON', 'EUR', 4.9762, CURRENT_DATE - INTERVAL '9 days'),
(gen_random_uuid(), 'RON', 'EUR', 4.9745, CURRENT_DATE - INTERVAL '8 days'),
(gen_random_uuid(), 'RON', 'EUR', 4.9780, CURRENT_DATE - INTERVAL '7 days'),
(gen_random_uuid(), 'RON', 'EUR', 4.9810, CURRENT_DATE - INTERVAL '6 days'),
(gen_random_uuid(), 'RON', 'EUR', 4.9790, CURRENT_DATE - INTERVAL '5 days'),
(gen_random_uuid(), 'RON', 'EUR', 4.9825, CURRENT_DATE - INTERVAL '4 days'),
(gen_random_uuid(), 'RON', 'EUR', 4.9850, CURRENT_DATE - INTERVAL '3 days'),
(gen_random_uuid(), 'RON', 'EUR', 4.9840, CURRENT_DATE - INTERVAL '2 days'),
(gen_random_uuid(), 'RON', 'EUR', 4.9875, CURRENT_DATE - INTERVAL '1 day'),

-- USD Trends (Volatile)
(gen_random_uuid(), 'RON', 'USD', 4.5120, CURRENT_DATE - INTERVAL '10 days'),
(gen_random_uuid(), 'RON', 'USD', 4.5350, CURRENT_DATE - INTERVAL '9 days'),
(gen_random_uuid(), 'RON', 'USD', 4.5210, CURRENT_DATE - INTERVAL '8 days'),
(gen_random_uuid(), 'RON', 'USD', 4.5500, CURRENT_DATE - INTERVAL '7 days'),
(gen_random_uuid(), 'RON', 'USD', 4.5420, CURRENT_DATE - INTERVAL '6 days'),
(gen_random_uuid(), 'RON', 'USD', 4.5680, CURRENT_DATE - INTERVAL '5 days'),
(gen_random_uuid(), 'RON', 'USD', 4.5320, CURRENT_DATE - INTERVAL '4 days'),
(gen_random_uuid(), 'RON', 'USD', 4.5200, CURRENT_DATE - INTERVAL '3 days'),
(gen_random_uuid(), 'RON', 'USD', 4.5450, CURRENT_DATE - INTERVAL '2 days'),
(gen_random_uuid(), 'RON', 'USD', 4.5580, CURRENT_DATE - INTERVAL '1 day'),

-- GBP Trends (Downward)
(gen_random_uuid(), 'RON', 'GBP', 5.8500, CURRENT_DATE - INTERVAL '10 days'),
(gen_random_uuid(), 'RON', 'GBP', 5.8420, CURRENT_DATE - INTERVAL '9 days'),
(gen_random_uuid(), 'RON', 'GBP', 5.8350, CURRENT_DATE - INTERVAL '8 days'),
(gen_random_uuid(), 'RON', 'GBP', 5.8400, CURRENT_DATE - INTERVAL '7 days'),
(gen_random_uuid(), 'RON', 'GBP', 5.8280, CURRENT_DATE - INTERVAL '6 days'),
(gen_random_uuid(), 'RON', 'GBP', 5.8200, CURRENT_DATE - INTERVAL '5 days'),
(gen_random_uuid(), 'RON', 'GBP', 5.8150, CURRENT_DATE - INTERVAL '4 days'),
(gen_random_uuid(), 'RON', 'GBP', 5.8180, CURRENT_DATE - INTERVAL '3 days'),
(gen_random_uuid(), 'RON', 'GBP', 5.8050, CURRENT_DATE - INTERVAL '2 days'),
(gen_random_uuid(), 'RON', 'GBP', 5.7950, CURRENT_DATE - INTERVAL '1 day');
