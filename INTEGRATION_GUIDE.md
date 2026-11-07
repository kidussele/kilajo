# KILAJO — Platform Integration Guide

This guide details the integration architecture for MetaTrader 4/5, cTrader, and file-based statement imports.

---

## 1. Zero-Credential Architecture
KILAJO strictly enforces a read-only architecture:
- **No Master Passwords:** KILAJO will never ask for your broker account master password.
- **No Investor Passwords:** Investor passwords are never transmitted to cloud servers.
- **Read-Only Telemetry:** Integrations communicate only outward-facing telemetry via encrypted webhooks or standardized file statements.

---

## 2. MetaTrader 5 & MetaTrader 4 Setup

### Step 1: Generate Sync Token
1. In KILAJO, navigate to **Accounts**.
2. Click the Key icon on your target account.
3. Copy your unique `klj_live_...` Sync Token.

### Step 2: Configure Terminal Permissions
1. Open your MetaTrader 4 or 5 terminal.
2. Navigate to **Tools → Options → Expert Advisors**.
3. Check **Allow WebRequest for listed URL**.
4. Add the URL: `https://kilajo.app` (or your local domain).

### Step 3: Attach the KILAJO Bridge EA
1. Place `kilajo_bridge.ex5` into `MQL5/Experts/` (or `MQL4/Experts/`).
2. Attach the EA to any 1 chart.
3. Paste your sync token into the EA input parameter.
4. The EA will automatically push newly closed deals to KILAJO in real time.

---

## 3. CSV / Statement Export Guide

### MetaTrader 5 Statement Export
1. In MT5, open the **History** tab in the Toolbox.
2. Right-click anywhere in the history list.
3. Select **Report → Open XML / CSV**.
4. In KILAJO, navigate to **Import Center**, upload the file, and confirm column mapping.

