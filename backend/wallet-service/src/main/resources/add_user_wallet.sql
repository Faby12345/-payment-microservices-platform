-- Script to add a new wallet and EUR account for user e8adff92-e00a-42f8-b109-fced6bca300c

-- 1. Create the Wallet
INSERT INTO wallet (id, user_id, status, created_at, updated_at)
VALUES (
    gen_random_uuid(), 
    'e8adff92-e00a-42f8-b109-fced6bca300c',
    'ACTIVE', 
    NOW(), 
    NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- 2. Create a EUR Account with 0 balance (only if not already present)
INSERT INTO account (id, wallet_id, iban, currency, balance, available_balance, version, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    w.id,
    'RO99PAYM' || lpad(floor(random() * 10000000000)::text, 10, '0'),
    'EUR', 
    0.00, 
    0.00, 
    0, 
    NOW(), 
    NOW()
FROM wallet w
WHERE w.user_id = 'e8adff92-e00a-42f8-b109-fced6bca300c'
AND NOT EXISTS (
    SELECT 1 FROM account a 
    WHERE a.wallet_id = w.id AND a.currency = 'EUR'
);
