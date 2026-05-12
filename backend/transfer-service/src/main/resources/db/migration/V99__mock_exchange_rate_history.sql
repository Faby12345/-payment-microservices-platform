-- Seed mock exchange rate history for ALL supported currencies for the last 10 days
-- Note: Using gen_random_uuid() for PostgreSQL

-- First, clear existing mock data to avoid primary key conflicts if re-run
DELETE FROM exchange_rate_history WHERE rate_date < CURRENT_DATE;

INSERT INTO exchange_rate_history (id, base_currency, target_currency, rate, rate_date)
VALUES 
-- EUR (Slightly Up)
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

-- USD (Volatile)
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

-- GBP (Downward)
(gen_random_uuid(), 'RON', 'GBP', 5.8500, CURRENT_DATE - INTERVAL '10 days'),
(gen_random_uuid(), 'RON', 'GBP', 5.8420, CURRENT_DATE - INTERVAL '9 days'),
(gen_random_uuid(), 'RON', 'GBP', 5.8350, CURRENT_DATE - INTERVAL '8 days'),
(gen_random_uuid(), 'RON', 'GBP', 5.8400, CURRENT_DATE - INTERVAL '7 days'),
(gen_random_uuid(), 'RON', 'GBP', 5.8280, CURRENT_DATE - INTERVAL '6 days'),
(gen_random_uuid(), 'RON', 'GBP', 5.8200, CURRENT_DATE - INTERVAL '5 days'),
(gen_random_uuid(), 'RON', 'GBP', 5.8150, CURRENT_DATE - INTERVAL '4 days'),
(gen_random_uuid(), 'RON', 'GBP', 5.8180, CURRENT_DATE - INTERVAL '3 days'),
(gen_random_uuid(), 'RON', 'GBP', 5.8050, CURRENT_DATE - INTERVAL '2 days'),
(gen_random_uuid(), 'RON', 'GBP', 5.7950, CURRENT_DATE - INTERVAL '1 day'),

-- CHF (Strong upward)
(gen_random_uuid(), 'RON', 'CHF', 5.2100, CURRENT_DATE - INTERVAL '10 days'),
(gen_random_uuid(), 'RON', 'CHF', 5.2350, CURRENT_DATE - INTERVAL '9 days'),
(gen_random_uuid(), 'RON', 'CHF', 5.2520, CURRENT_DATE - INTERVAL '8 days'),
(gen_random_uuid(), 'RON', 'CHF', 5.2800, CURRENT_DATE - INTERVAL '7 days'),
(gen_random_uuid(), 'RON', 'CHF', 5.3100, CURRENT_DATE - INTERVAL '6 days'),
(gen_random_uuid(), 'RON', 'CHF', 5.2950, CURRENT_DATE - INTERVAL '5 days'),
(gen_random_uuid(), 'RON', 'CHF', 5.3300, CURRENT_DATE - INTERVAL '4 days'),
(gen_random_uuid(), 'RON', 'CHF', 5.3550, CURRENT_DATE - INTERVAL '3 days'),
(gen_random_uuid(), 'RON', 'CHF', 5.3820, CURRENT_DATE - INTERVAL '2 days'),
(gen_random_uuid(), 'RON', 'CHF', 5.4100, CURRENT_DATE - INTERVAL '1 day'),

-- CAD (Stable with dips)
(gen_random_uuid(), 'RON', 'CAD', 3.2500, CURRENT_DATE - INTERVAL '10 days'),
(gen_random_uuid(), 'RON', 'CAD', 3.2450, CURRENT_DATE - INTERVAL '9 days'),
(gen_random_uuid(), 'RON', 'CAD', 3.2320, CURRENT_DATE - INTERVAL '8 days'),
(gen_random_uuid(), 'RON', 'CAD', 3.2280, CURRENT_DATE - INTERVAL '7 days'),
(gen_random_uuid(), 'RON', 'CAD', 3.2350, CURRENT_DATE - INTERVAL '6 days'),
(gen_random_uuid(), 'RON', 'CAD', 3.2420, CURRENT_DATE - INTERVAL '5 days'),
(gen_random_uuid(), 'RON', 'CAD', 3.2380, CURRENT_DATE - INTERVAL '4 days'),
(gen_random_uuid(), 'RON', 'CAD', 3.2450, CURRENT_DATE - INTERVAL '3 days'),
(gen_random_uuid(), 'RON', 'CAD', 3.2510, CURRENT_DATE - INTERVAL '2 days'),
(gen_random_uuid(), 'RON', 'CAD', 3.2550, CURRENT_DATE - INTERVAL '1 day'),

-- AUD (Cyclical)
(gen_random_uuid(), 'RON', 'AUD', 2.9500, CURRENT_DATE - INTERVAL '10 days'),
(gen_random_uuid(), 'RON', 'AUD', 2.9720, CURRENT_DATE - INTERVAL '9 days'),
(gen_random_uuid(), 'RON', 'AUD', 2.9850, CURRENT_DATE - INTERVAL '8 days'),
(gen_random_uuid(), 'RON', 'AUD', 2.9650, CURRENT_DATE - INTERVAL '7 days'),
(gen_random_uuid(), 'RON', 'AUD', 2.9420, CURRENT_DATE - INTERVAL '6 days'),
(gen_random_uuid(), 'RON', 'AUD', 2.9310, CURRENT_DATE - INTERVAL '5 days'),
(gen_random_uuid(), 'RON', 'AUD', 2.9550, CURRENT_DATE - INTERVAL '4 days'),
(gen_random_uuid(), 'RON', 'AUD', 2.9780, CURRENT_DATE - INTERVAL '3 days'),
(gen_random_uuid(), 'RON', 'AUD', 2.9920, CURRENT_DATE - INTERVAL '2 days'),
(gen_random_uuid(), 'RON', 'AUD', 2.9850, CURRENT_DATE - INTERVAL '1 day'),

-- JPY (Low value, high growth)
(gen_random_uuid(), 'RON', 'JPY', 0.0275, CURRENT_DATE - INTERVAL '10 days'),
(gen_random_uuid(), 'RON', 'JPY', 0.0276, CURRENT_DATE - INTERVAL '9 days'),
(gen_random_uuid(), 'RON', 'JPY', 0.0274, CURRENT_DATE - INTERVAL '8 days'),
(gen_random_uuid(), 'RON', 'JPY', 0.0278, CURRENT_DATE - INTERVAL '7 days'),
(gen_random_uuid(), 'RON', 'JPY', 0.0281, CURRENT_DATE - INTERVAL '6 days'),
(gen_random_uuid(), 'RON', 'JPY', 0.0279, CURRENT_DATE - INTERVAL '5 days'),
(gen_random_uuid(), 'RON', 'JPY', 0.0283, CURRENT_DATE - INTERVAL '4 days'),
(gen_random_uuid(), 'RON', 'JPY', 0.0285, CURRENT_DATE - INTERVAL '3 days'),
(gen_random_uuid(), 'RON', 'JPY', 0.0284, CURRENT_DATE - INTERVAL '2 days'),
(gen_random_uuid(), 'RON', 'JPY', 0.0287, CURRENT_DATE - INTERVAL '1 day'),

-- CZK (Stable)
(gen_random_uuid(), 'RON', 'CZK', 0.1980, CURRENT_DATE - INTERVAL '10 days'),
(gen_random_uuid(), 'RON', 'CZK', 0.1985, CURRENT_DATE - INTERVAL '9 days'),
(gen_random_uuid(), 'RON', 'CZK', 0.1982, CURRENT_DATE - INTERVAL '8 days'),
(gen_random_uuid(), 'RON', 'CZK', 0.1988, CURRENT_DATE - INTERVAL '7 days'),
(gen_random_uuid(), 'RON', 'CZK', 0.1991, CURRENT_DATE - INTERVAL '6 days'),
(gen_random_uuid(), 'RON', 'CZK', 0.1989, CURRENT_DATE - INTERVAL '5 days'),
(gen_random_uuid(), 'RON', 'CZK', 0.1995, CURRENT_DATE - INTERVAL '4 days'),
(gen_random_uuid(), 'RON', 'CZK', 0.1998, CURRENT_DATE - INTERVAL '3 days'),
(gen_random_uuid(), 'RON', 'CZK', 0.1996, CURRENT_DATE - INTERVAL '2 days'),
(gen_random_uuid(), 'RON', 'CZK', 0.1999, CURRENT_DATE - INTERVAL '1 day'),

-- PLN (Recovery)
(gen_random_uuid(), 'RON', 'PLN', 1.1200, CURRENT_DATE - INTERVAL '10 days'),
(gen_random_uuid(), 'RON', 'PLN', 1.1150, CURRENT_DATE - INTERVAL '9 days'),
(gen_random_uuid(), 'RON', 'PLN', 1.1250, CURRENT_DATE - INTERVAL '8 days'),
(gen_random_uuid(), 'RON', 'PLN', 1.1320, CURRENT_DATE - INTERVAL '7 days'),
(gen_random_uuid(), 'RON', 'PLN', 1.1450, CURRENT_DATE - INTERVAL '6 days'),
(gen_random_uuid(), 'RON', 'PLN', 1.1520, CURRENT_DATE - INTERVAL '5 days'),
(gen_random_uuid(), 'RON', 'PLN', 1.1680, CURRENT_DATE - INTERVAL '4 days'),
(gen_random_uuid(), 'RON', 'PLN', 1.1750, CURRENT_DATE - INTERVAL '3 days'),
(gen_random_uuid(), 'RON', 'PLN', 1.1820, CURRENT_DATE - INTERVAL '2 days'),
(gen_random_uuid(), 'RON', 'PLN', 1.1950, CURRENT_DATE - INTERVAL '1 day'),

-- HUF (Inflation simulation)
(gen_random_uuid(), 'RON', 'HUF', 0.0125, CURRENT_DATE - INTERVAL '10 days'),
(gen_random_uuid(), 'RON', 'HUF', 0.0128, CURRENT_DATE - INTERVAL '9 days'),
(gen_random_uuid(), 'RON', 'HUF', 0.0132, CURRENT_DATE - INTERVAL '8 days'),
(gen_random_uuid(), 'RON', 'HUF', 0.0130, CURRENT_DATE - INTERVAL '7 days'),
(gen_random_uuid(), 'RON', 'HUF', 0.0135, CURRENT_DATE - INTERVAL '6 days'),
(gen_random_uuid(), 'RON', 'HUF', 0.0138, CURRENT_DATE - INTERVAL '5 days'),
(gen_random_uuid(), 'RON', 'HUF', 0.0142, CURRENT_DATE - INTERVAL '4 days'),
(gen_random_uuid(), 'RON', 'HUF', 0.0145, CURRENT_DATE - INTERVAL '3 days'),
(gen_random_uuid(), 'RON', 'HUF', 0.0143, CURRENT_DATE - INTERVAL '2 days'),
(gen_random_uuid(), 'RON', 'HUF', 0.0147, CURRENT_DATE - INTERVAL '1 day');
