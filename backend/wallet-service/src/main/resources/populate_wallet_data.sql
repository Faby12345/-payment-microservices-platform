-- 1. Create the Wallet for this user
INSERT INTO wallet (id, user_id, status, created_at, updated_at)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 
    'd55453b7-35b8-463d-852e-14e2ca28847a',
    'ACTIVE', 
    NOW(), 
    NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- 2. Create a EUR Account for this wallet
INSERT INTO account (id, wallet_id, currency, balance, available_balance, version, created_at, updated_at)
VALUES (
    'f1e2d3c4-b5a6-9a8b-7c6d-5e4f3a2b1c0d', 
    (SELECT id FROM wallet WHERE user_id = 'd55453b7-35b8-463d-852e-14e2ca28847a'),
    'EUR', 
    4694.60, 
    4694.60, 
    0, 
    NOW() - INTERVAL '30 days', 
    NOW() - INTERVAL '30 days'
) ON CONFLICT (id) DO NOTHING;

-- 3. Add Deposit: Initial Top-up
INSERT INTO wallet_transactions (
    id, type, status, source_currency, source_amount, 
    destination_currency, destination_amount, exchange_rate, 
    to_account_id, reference, description, idempotency_key, 
    created_at, updated_at
) VALUES (
    gen_random_uuid(), 'DEPOSIT', 'COMPLETED', 'EUR', 1500.00, 'EUR', 1500.00, 1.0,
    (SELECT id FROM account WHERE wallet_id = (SELECT id FROM wallet WHERE user_id = 'd55453b7-35b8-463d-852e-14e2ca28847a') AND currency = 'EUR'),
    'REF-DEP-101', 'Initial Top-up', 'key-101', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
);

-- 4. Add Withdrawal: Starbucks Coffee
INSERT INTO wallet_transactions (
    id, type, status, source_currency, source_amount, 
    destination_currency, destination_amount, exchange_rate, 
    from_account_id, reference, description, idempotency_key, 
    created_at, updated_at
) VALUES (
    gen_random_uuid(), 'WITHDRAWAL', 'COMPLETED', 'EUR', 5.40, 'EUR', 5.40, 1.0,
    (SELECT id FROM account WHERE wallet_id = (SELECT id FROM wallet WHERE user_id = 'd55453b7-35b8-463d-852e-14e2ca28847a') AND currency = 'EUR'),
    'REF-WTH-102', 'Starbucks Coffee', 'key-102', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
);

-- 5. Add Deposit: Salary
INSERT INTO wallet_transactions (
    id, type, status, source_currency, source_amount, 
    destination_currency, destination_amount, exchange_rate, 
    to_account_id, reference, description, idempotency_key, 
    created_at, updated_at
) VALUES (
    gen_random_uuid(), 'DEPOSIT', 'COMPLETED', 'EUR', 3200.00, 'EUR', 3200.00, 1.0,
    (SELECT id FROM account WHERE wallet_id = (SELECT id FROM wallet WHERE user_id = 'd55453b7-35b8-463d-852e-14e2ca28847a') AND currency = 'EUR'),
    'REF-DEP-103', 'Monthly Salary', 'key-103', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
);
