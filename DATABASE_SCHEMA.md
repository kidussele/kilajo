# KILAJO — Database Schema Documentation

## Database Overview
- **Engine:** PostgreSQL 15+ (Compatible with Supabase)
- **Primary Migration File:** `supabase/migrations/20261107000000_initial_schema.sql`
- **Security:** Complete Row Level Security (RLS) enabled on all user-owned tables.

---

## Core Entities

### 1. `profiles`
Extends Supabase `auth.users` with user preferences.
- `id` (UUID, PK, FK -> auth.users.id)
- `full_name` (TEXT)
- `avatar_url` (TEXT)
- `timezone` (TEXT, default 'UTC')
- `base_currency` (VARCHAR(10), default 'USD')
- `theme_preference` (VARCHAR(10), default 'light')

### 2. `trading_accounts`
Represents isolated trading accounts across brokers and prop firms.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> profiles.id)
- `name` (VARCHAR(100))
- `broker` (VARCHAR(100))
- `platform` (VARCHAR(50))
- `account_type` (VARCHAR(50))
- `currency` (VARCHAR(10))
- `initial_balance` (NUMERIC(18, 4))
- `current_balance` (NUMERIC(18, 4))
- `is_prop_firm` (BOOLEAN)
- `prop_firm_name` (VARCHAR(100))
- `connection_status` (VARCHAR(50))

### 3. `trades`
The central trading journal ledger.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> profiles.id)
- `account_id` (UUID, FK -> trading_accounts.id)
- `strategy_id` (UUID, FK -> strategies.id)
- `symbol` (VARCHAR(50))
- `direction` (VARCHAR(10), CHECK: BUY or SELL)
- `quantity` (NUMERIC(18, 4))
- `entry_price` (NUMERIC(18, 6))
- `exit_price` (NUMERIC(18, 6))
- `stop_loss` (NUMERIC(18, 6))
- `take_profit` (NUMERIC(18, 6))
- `entry_time` (TIMESTAMPTZ)
- `exit_time` (TIMESTAMPTZ)
- `status` (VARCHAR(20), CHECK: OPEN, CLOSED, CANCELLED)
- `gross_pnl` (NUMERIC(18, 4))
- `commission` (NUMERIC(18, 4))
- `swap` (NUMERIC(18, 4))
- `net_pnl` (NUMERIC(18, 4))
- `risk_amount` (NUMERIC(18, 4))
- `r_multiple` (NUMERIC(10, 2))
- `session` (VARCHAR(30))
- `emotion_before` (VARCHAR(50))
- `emotion_after` (VARCHAR(50))
- `discipline_rating` (INTEGER, 1-5)
- `mistakes` (TEXT[])
- `source_ticket` (VARCHAR(100))

### 4. `prop_firm_rules`
Configurable evaluation guardrails.
- `id` (UUID, PK)
- `account_id` (UUID, FK -> trading_accounts.id)
- `firm_name` (VARCHAR(100))
- `phase` (INTEGER)
- `initial_balance` (NUMERIC(18, 4))
- `profit_target_pct` (NUMERIC(6, 2))
- `daily_loss_limit_pct` (NUMERIC(6, 2))
- `max_loss_limit_pct` (NUMERIC(6, 2))
- `min_trading_days` (INTEGER)
- `status` (VARCHAR(30), CHECK: ACTIVE, PASSED, FAILED, DISQUALIFIED)

### 5. `psychology_logs`
Behavioral and mindset audit logs.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> profiles.id)
- `date` (DATE)
- `mood_score` (INTEGER, 1-10)
- `discipline_score` (INTEGER, 1-10)
- `stress_level` (INTEGER, 1-10)
- `sleep_hours` (NUMERIC(4, 1))
- `lessons_learned` (TEXT)
- `notes` (TEXT)

