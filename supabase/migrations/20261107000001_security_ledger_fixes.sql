-- =====================================================================
-- KILAJO — SECURITY, LEDGER & EXECUTION INTEGRITY MIGRATION
-- Version: 1.1.0
-- =====================================================================

-- 1. ACCOUNT TRANSACTIONS LEDGER (Financial Source of Truth)
CREATE TABLE IF NOT EXISTS account_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
    transaction_type VARCHAR(40) NOT NULL CHECK (
        transaction_type IN (
            'INITIAL_BALANCE',
            'DEPOSIT',
            'WITHDRAWAL',
            'REALIZED_PNL',
            'COMMISSION',
            'SWAP',
            'FEE',
            'ADJUSTMENT'
        )
    ),
    amount NUMERIC(18, 4) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    description TEXT,
    reference_ticket VARCHAR(100),
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index to prevent duplicate financial transaction ledger records
CREATE UNIQUE INDEX IF NOT EXISTS idx_account_trans_unique_ref 
ON account_transactions (account_id, reference_ticket, transaction_type) 
WHERE reference_ticket IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_account_trans_acc_time 
ON account_transactions (account_id, transaction_time);

-- 2. DURABLE PER-EXECUTION IDEMPOTENCY
-- Ensure trade_executions has account_id and provider for composite idempotency
ALTER TABLE trade_executions 
ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES trading_accounts(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'MT5';

CREATE UNIQUE INDEX IF NOT EXISTS idx_trade_executions_idempotency 
ON trade_executions (account_id, provider, ticket) 
WHERE ticket IS NOT NULL;

-- 3. ENABLE ROW LEVEL SECURITY ON NEW TABLE
ALTER TABLE account_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage account transactions" ON account_transactions
    FOR ALL USING (auth.uid() = user_id);

