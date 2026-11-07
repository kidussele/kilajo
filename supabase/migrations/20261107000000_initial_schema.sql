-- =====================================================================
-- KILAJO — UNIVERSAL TRADING JOURNAL & ANALYTICS SCHEMA
-- Version: 1.0.0
-- Database: PostgreSQL (Supabase Compatible)
-- =====================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    base_currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    theme_preference VARCHAR(10) NOT NULL DEFAULT 'light',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TRADING ACCOUNTS
CREATE TABLE IF NOT EXISTS trading_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    broker VARCHAR(100) NOT NULL,
    platform VARCHAR(50) NOT NULL DEFAULT 'MetaTrader 5', -- MT4, MT5, cTrader, TradingView, Manual, Other
    account_type VARCHAR(50) NOT NULL DEFAULT 'Live', -- Live, Demo, Prop Challenge, Prop Funded
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    initial_balance NUMERIC(18, 4) NOT NULL DEFAULT 10000.0000,
    current_balance NUMERIC(18, 4) NOT NULL DEFAULT 10000.0000,
    is_prop_firm BOOLEAN NOT NULL DEFAULT FALSE,
    prop_firm_name VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    connection_status VARCHAR(50) NOT NULL DEFAULT 'manual', -- manual, connected, sync_failed, disconnected
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. STRATEGIES
CREATE TABLE IF NOT EXISTS strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    timeframe VARCHAR(20),
    entry_conditions TEXT,
    exit_conditions TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TAGS
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20) DEFAULT '#3b82f6',
    category VARCHAR(50) DEFAULT 'general', -- setup, session, mistake, condition
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- 5. TRADES
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL,
    symbol VARCHAR(50) NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('BUY', 'SELL')),
    quantity NUMERIC(18, 4) NOT NULL,
    entry_price NUMERIC(18, 6) NOT NULL,
    exit_price NUMERIC(18, 6),
    stop_loss NUMERIC(18, 6),
    take_profit NUMERIC(18, 6),
    entry_time TIMESTAMPTZ NOT NULL,
    exit_time TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'CLOSED' CHECK (status IN ('OPEN', 'CLOSED', 'CANCELLED')),
    gross_pnl NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    commission NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    swap NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    fees NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    net_pnl NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    pnl_percentage NUMERIC(10, 4) DEFAULT 0.0000,
    risk_amount NUMERIC(18, 4),
    r_multiple NUMERIC(10, 2),
    session VARCHAR(30), -- Asian, London, New York, London-NY Overlap
    emotion_before VARCHAR(50), -- Calm, Confident, Anxious, Fearful, Greedy, Bored, Rushed
    emotion_during VARCHAR(50),
    emotion_after VARCHAR(50),  -- Satisfied, Regretful, Frustrated, Relieved, Neutral
    discipline_rating INTEGER CHECK (discipline_rating BETWEEN 1 AND 5),
    mistakes TEXT[], -- Array of strings e.g. ['FOMO', 'Moved Stop Loss', 'Overleveraged']
    notes TEXT,
    source VARCHAR(50) NOT NULL DEFAULT 'MANUAL', -- MANUAL, CSV_IMPORT, MT5_BRIDGE, MT4_BRIDGE, CTRADER
    source_ticket VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index to prevent duplicate trade import from external tickets
CREATE UNIQUE INDEX IF NOT EXISTS idx_trades_account_source_ticket 
ON trades (account_id, source_ticket) 
WHERE source_ticket IS NOT NULL;

-- 6. TRADE EXECUTIONS (For partial fills / scale-ins / multiple orders per position)
CREATE TABLE IF NOT EXISTS trade_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
    ticket VARCHAR(100),
    side VARCHAR(10) NOT NULL CHECK (side IN ('BUY', 'SELL')),
    price NUMERIC(18, 6) NOT NULL,
    quantity NUMERIC(18, 4) NOT NULL,
    commission NUMERIC(18, 4) DEFAULT 0.0000,
    swap NUMERIC(18, 4) DEFAULT 0.0000,
    execution_time TIMESTAMPTZ NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TRADE TAGS (Junction Table)
CREATE TABLE IF NOT EXISTS trade_tags (
    trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (trade_id, tag_id)
);

-- 8. TRADE SCREENSHOTS
CREATE TABLE IF NOT EXISTS trade_screenshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    timeframe VARCHAR(20),
    screenshot_type VARCHAR(20) DEFAULT 'EXIT', -- ENTRY, EXIT, HIGHER_TF, DAILY
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TRADE REVIEWS
CREATE TABLE IF NOT EXISTS trade_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade_id UUID NOT NULL UNIQUE REFERENCES trades(id) ON DELETE CASCADE,
    followed_plan BOOLEAN NOT NULL DEFAULT TRUE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    what_went_well TEXT,
    what_to_improve TEXT,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PROP FIRM RULES & TRACKING
CREATE TABLE IF NOT EXISTS prop_firm_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL UNIQUE REFERENCES trading_accounts(id) ON DELETE CASCADE,
    firm_name VARCHAR(100) NOT NULL,
    challenge_type VARCHAR(50) NOT NULL DEFAULT '2-Step Evaluation',
    phase INTEGER NOT NULL DEFAULT 1,
    initial_balance NUMERIC(18, 4) NOT NULL,
    profit_target_pct NUMERIC(6, 2) NOT NULL DEFAULT 10.00,
    daily_loss_limit_pct NUMERIC(6, 2) NOT NULL DEFAULT 5.00,
    max_loss_limit_pct NUMERIC(6, 2) NOT NULL DEFAULT 10.00,
    min_trading_days INTEGER NOT NULL DEFAULT 5,
    max_calendar_days INTEGER,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PASSED', 'FAILED', 'DISQUALIFIED')),
    breach_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. PSYCHOLOGY LOGS & DAILY REFLECTIONS
CREATE TABLE IF NOT EXISTS psychology_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
    discipline_score INTEGER CHECK (discipline_score BETWEEN 1 AND 10),
    stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
    sleep_hours NUMERIC(4, 1),
    market_prep_done BOOLEAN DEFAULT FALSE,
    rule_violations TEXT[],
    lessons_learned TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- 12. GOALS
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'PROFIT' CHECK (type IN ('PROFIT', 'WIN_RATE', 'DISCIPLINE', 'RISK', 'MAX_LOSS')),
    target_value NUMERIC(18, 4) NOT NULL,
    current_value NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    period VARCHAR(20) NOT NULL DEFAULT 'MONTHLY' CHECK (period IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. RAW IMPORTS & AUDIT HISTORY
CREATE TABLE IF NOT EXISTS raw_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    broker_format VARCHAR(50) NOT NULL,
    rows_total INTEGER NOT NULL DEFAULT 0,
    rows_imported INTEGER NOT NULL DEFAULT 0,
    rows_skipped INTEGER NOT NULL DEFAULT 0,
    rows_duplicate INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',
    error_summary JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. INTEGRATION BRIDGES & TOKENS
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- MT5, MT4, cTrader
    bridge_token_hash TEXT NOT NULL,
    sync_mode VARCHAR(30) NOT NULL DEFAULT 'READ_ONLY',
    last_ping_at TIMESTAMPTZ,
    last_sync_at TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'DISCONNECTED',
    server_info JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(account_id, provider)
);

-- 15. ACCOUNT SNAPSHOTS (For historical equity/drawdown analysis)
CREATE TABLE IF NOT EXISTS account_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    snapshot_time TIMESTAMPTZ NOT NULL,
    balance NUMERIC(18, 4) NOT NULL,
    equity NUMERIC(18, 4) NOT NULL,
    open_pnl NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_account_id ON trades(account_id);
CREATE INDEX IF NOT EXISTS idx_trades_entry_time ON trades(entry_time);
CREATE INDEX IF NOT EXISTS idx_trades_exit_time ON trades(exit_time);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_strategy_id ON trades(strategy_id);
CREATE INDEX IF NOT EXISTS idx_account_snapshots_acc_time ON account_snapshots(account_id, snapshot_time);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE prop_firm_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychology_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_snapshots ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Trading Accounts
CREATE POLICY "Users can manage their own accounts" ON trading_accounts
    FOR ALL USING (auth.uid() = user_id);

-- 3. Strategies
CREATE POLICY "Users can manage their own strategies" ON strategies
    FOR ALL USING (auth.uid() = user_id);

-- 4. Tags
CREATE POLICY "Users can manage their own tags" ON tags
    FOR ALL USING (auth.uid() = user_id);

-- 5. Trades
CREATE POLICY "Users can manage their own trades" ON trades
    FOR ALL USING (auth.uid() = user_id);

-- 6. Trade Executions (Scoped through trades ownership)
CREATE POLICY "Users can manage trade executions" ON trade_executions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM trades WHERE trades.id = trade_executions.trade_id AND trades.user_id = auth.uid()
        )
    );

-- 7. Trade Screenshots
CREATE POLICY "Users can manage screenshots" ON trade_screenshots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM trades WHERE trades.id = trade_screenshots.trade_id AND trades.user_id = auth.uid()
        )
    );

-- 8. Trade Reviews
CREATE POLICY "Users can manage reviews" ON trade_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM trades WHERE trades.id = trade_reviews.trade_id AND trades.user_id = auth.uid()
        )
    );

-- 9. Prop Firm Rules
CREATE POLICY "Users can manage prop firm rules" ON prop_firm_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM trading_accounts WHERE trading_accounts.id = prop_firm_rules.account_id AND trading_accounts.user_id = auth.uid()
        )
    );

-- 10. Psychology Logs
CREATE POLICY "Users can manage psychology logs" ON psychology_logs
    FOR ALL USING (auth.uid() = user_id);

-- 11. Goals
CREATE POLICY "Users can manage goals" ON goals
    FOR ALL USING (auth.uid() = user_id);

-- 12. Raw Imports
CREATE POLICY "Users can manage imports" ON raw_imports
    FOR ALL USING (auth.uid() = user_id);

-- 13. Integrations
CREATE POLICY "Users can manage integrations" ON integrations
    FOR ALL USING (auth.uid() = user_id);

-- 14. Snapshots
CREATE POLICY "Users can manage snapshots" ON account_snapshots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM trading_accounts WHERE trading_accounts.id = account_snapshots.account_id AND trading_accounts.user_id = auth.uid()
        )
    );
