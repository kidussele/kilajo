# KILAJO — Universal Trading Journal & Analytics Platform

> **ONE JOURNAL. MULTIPLE BROKERS. MULTIPLE ACCOUNTS. ONE UNIFIED ANALYTICS SYSTEM.**

KILAJO is a universal, broker-independent trading journal and institutional performance analytics platform. Built for serious retail traders, prop firm challengers, and fund managers to unify multi-broker trade executions into one synchronized analytics suite.

---

## 🌟 Key Features

- **Universal Multi-Account Portfolio:** Connect and monitor unlimited trading accounts across different brokers (MetaTrader 4/5, cTrader, Interactive Brokers, OANDA, etc.) and prop firms (FTMO, FundedNext, MFF, Apex, Topstep).
- **Institutional Analytics Engine:** Real-time calculation of Net/Gross P&L, Win Rate (excluding breakeven trades), Expectancy, Profit Factor, Risk-to-Reward, Sharpe ratios, and chronological peak-to-trough Drawdown.
- **5-Step Import Center:** Universal statement mapping engine supporting CSV, TSV, HTML statements, automatic column detection, and cryptographic duplicate ticket prevention.
- **Prop Firm Challenge Tracker:** Live evaluation tracking with configurable profit targets, daily loss limits, maximum trailing/static drawdown buffers, and min trading days compliance.
- **Behavioral & Psychological Audits:** Quantified cost-of-mistakes analysis (FOMO, revenge trading, overleveraging), pre/post trade emotion correlation, and daily discipline ratings.
- **Strategy Playbook:** Document technical setups, entry/exit criteria, and audit the win rate and net return of individual trading strategies.
- **Execution Calendar & Heatmap:** Interactive day-by-day P&L visualization and win/loss totals.
- **Auditable Statements & Export:** Full CSV and printable PDF statement export capabilities.
- **Data Isolation:** Complete boundary between user production accounts and isolated demo datasets.

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts.
- **Backend & Database:** Next.js Server Endpoints, Supabase PostgreSQL with Row Level Security (RLS).
- **Integrations:** Universal Provider Adapter Architecture (MT4/MT5 Webhook Bridge, cTrader statement normalization, CSV/Excel mapper).

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/kidussele/kilajo.git
cd kilajo
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Provide your Supabase URL and Anon Key when connecting to production cloud database. (The application runs locally with local state management if cloud credentials are not supplied).

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the platform.

### 4. Run Automated Tests
```bash
npm test
```

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📚 Documentation Index

- [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md) — System pipeline & provider adapter architecture
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) — Complete PostgreSQL schema & RLS policies
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) — REST & Webhook endpoints
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) — MetaTrader 4/5 EA & cTrader setup guide
- [SECURITY.md](./SECURITY.md) — Authorization, multi-tenant isolation, and data safety
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Vercel and Supabase production deployment guide
- [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) — Milestone execution and future phases

---

## ⚖️ License

Private proprietary software. All rights reserved.
