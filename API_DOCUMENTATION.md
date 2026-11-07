# KILAJO — API Documentation

## Universal Ingestion Endpoints

### 1. MT5 / MT4 Deal Webhook
Transmits executed trades from the KILAJO bridge Expert Advisor into the normalized journal.

- **Endpoint:** `POST /api/integrations/mt5/webhook`
- **Authentication:** `Authorization: Bearer <account_sync_token>`
- **Content-Type:** `application/json`

#### Request Payload Schema
```json
{
  "account_id": "acc-uuid-or-id",
  "deals": [
    {
      "ticket": "908231",
      "symbol": "EURUSD",
      "type": "BUY",
      "volume": 1.0,
      "open_price": 1.08250,
      "close_price": 1.08750,
      "open_time": "2026-11-01T08:30:00Z",
      "close_time": "2026-11-01T14:15:00Z",
      "commission": -7.00,
      "swap": 0.00,
      "profit": 500.00,
      "sl": 1.07900,
      "tp": 1.08750
    }
  ]
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "recordsReceived": 1,
  "tradesNormalized": 1,
  "message": "Deal executions received and validated successfully."
}
```

#### Error Response (401 Unauthorized)
```json
{
  "error": "Unauthorized: Missing or invalid Bearer token"
}
```
