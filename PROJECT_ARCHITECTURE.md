# KILAJO — System & Data Architecture

## 1. Universal Data Pipeline

Financial data models across MetaTrader, cTrader, Interactive Brokers, and proprietary platforms handle executions, orders, and deals differently. KILAJO employs a strict multi-stage ingestion pipeline:

```
External Trading Source (EA / Webhook / Statement / API)
         │
         ▼
Provider Adapter (Normalization to NormalizedTrade schema)
         │
         ▼
Validation & Formatting Layer (Date parsing, sign corrections)
         │
         ▼
De-duplication Engine (Composite key: account_id + source_ticket)
         │
         ▼
Persistence Layer (PostgreSQL with Row Level Security)
         │
         ▼
Financial Analytics Engine (Realized P&L, Drawdown, Expectancy)
         │
         ▼
Presentation Layer (Next.js Responsive Client Components)
```

---

## 2. Calculation Standards

### A. Realized Net P&L
```
Net P&L = Realized Gross Profit - Total Commissions - Total Swap - Applicable Broker Fees
```

### B. Win Rate
```
Win Rate (%) = [Winning Trades / (Winning Trades + Losing Trades)] * 100
```
*Note: Breakeven trades (where Net P&L = 0.00) are explicitly excluded from the denominator to maintain mathematical rigor.*

### C. Profit Factor
```
Profit Factor = Gross Realized Profit / |Gross Realized Loss|
```

### D. Chronological Peak-to-Trough Drawdown
Drawdown is calculated chronologically from the cumulative equity progression:
```
Current Drawdown = Peak Balance - Current Balance
Drawdown % = (Current Drawdown / Peak Balance) * 100
```
