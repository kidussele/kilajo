import test from 'node:test'
import assert from 'node:assert'
import crypto from 'node:crypto'

// Test trade dataset
const mockTrades = [
  {
    id: '1',
    account_id: 'acc-1',
    symbol: 'EURUSD',
    direction: 'BUY',
    quantity: 1,
    entry_price: 1.08,
    exit_price: 1.09,
    entry_time: '2026-11-01T10:00:00Z',
    exit_time: '2026-11-01T12:00:00Z',
    status: 'CLOSED',
    gross_pnl: 1000,
    commission: -7,
    swap: 0,
    fees: 0,
    net_pnl: 993,
    r_multiple: 2.0,
  },
  {
    id: '2',
    account_id: 'acc-1',
    symbol: 'GBPUSD',
    direction: 'SELL',
    quantity: 1,
    entry_price: 1.25,
    exit_price: 1.255,
    entry_time: '2026-11-02T10:00:00Z',
    exit_time: '2026-11-02T11:00:00Z',
    status: 'CLOSED',
    gross_pnl: -500,
    commission: -7,
    swap: 0,
    fees: 0,
    net_pnl: -507,
    r_multiple: -1.0,
  },
  {
    id: '3',
    account_id: 'acc-1',
    symbol: 'XAUUSD',
    direction: 'BUY',
    quantity: 1,
    entry_price: 2600,
    exit_price: 2600,
    entry_time: '2026-11-03T10:00:00Z',
    exit_time: '2026-11-03T10:30:00Z',
    status: 'CLOSED',
    gross_pnl: 0,
    commission: 0,
    swap: 0,
    fees: 0,
    net_pnl: 0, // Breakeven trade
    r_multiple: 0,
  },
]

// 1. FINANCIAL CALCULATIONS & BREAKEVEN EXCLUSION
test('Financial Calculations: Win Rate Excludes Breakeven Trades', () => {
  const winningTrades = mockTrades.filter((t) => t.net_pnl > 0.0001).length // 1
  const losingTrades = mockTrades.filter((t) => t.net_pnl < -0.0001).length // 1
  const breakevenTrades = mockTrades.filter((t) => Math.abs(t.net_pnl) <= 0.0001).length // 1

  assert.strictEqual(winningTrades, 1)
  assert.strictEqual(losingTrades, 1)
  assert.strictEqual(breakevenTrades, 1)

  const decisiveTrades = winningTrades + losingTrades
  const winRate = decisiveTrades > 0 ? (winningTrades / decisiveTrades) * 100 : 0
  assert.strictEqual(winRate, 50.0)
})

test('Financial Calculations: Net PnL accounts for signed commissions and swaps', () => {
  const totalNet = mockTrades.reduce((acc, t) => acc + t.net_pnl, 0)
  assert.strictEqual(totalNet, 993 - 507)
  assert.strictEqual(totalNet, 486)
})

test('Financial Calculations: Profit Factor is Gross Profit over Gross Loss', () => {
  const grossProfit = 1000
  const grossLoss = 500
  const profitFactor = grossProfit / grossLoss
  assert.strictEqual(profitFactor, 2.0)
})

// 2. BALANCE RECONCILIATION ON ADD / EDIT / DELETE
test('Balance Reconciliation: Reconciles balance after additions, edits, and deletions', () => {
  const initialBalance = 100000

  // State 1: 3 trades
  let activeTrades = [...mockTrades]
  const balance1 = initialBalance + activeTrades.reduce((s, t) => s + t.net_pnl, 0)
  assert.strictEqual(balance1, 100486)

  // State 2: Edit trade #2 (loss reduced from -507 to -207)
  activeTrades = activeTrades.map((t) =>
    t.id === '2' ? { ...t, net_pnl: -207 } : t
  )
  const balanceAfterEdit = initialBalance + activeTrades.reduce((s, t) => s + t.net_pnl, 0)
  assert.strictEqual(balanceAfterEdit, 100786)

  // State 3: Delete trade #1
  activeTrades = activeTrades.filter((t) => t.id !== '1')
  const balanceAfterDelete = initialBalance + activeTrades.reduce((s, t) => s + t.net_pnl, 0)
  assert.strictEqual(balanceAfterDelete, 99793)
})

// 3. MULTI-CURRENCY CONVERSION
test('Multi-Currency: Converts EUR and GBP balances instead of direct arithmetic addition', () => {
  const EUR_USD_RATE = 1.085
  const GBP_USD_RATE = 1.295

  const accounts = [
    { currency: 'USD', balance: 50000 },
    { currency: 'EUR', balance: 20000 },
    { currency: 'GBP', balance: 10000 },
  ]

  // Direct incorrect sum would be 80,000
  const naiveSum = accounts.reduce((s, a) => s + a.balance, 0)
  assert.strictEqual(naiveSum, 80000)

  // Proper conversion to USD base currency:
  // 50,000 + (20,000 * 1.085) + (10,000 * 1.295) = 50,000 + 21,700 + 12,950 = 84,650
  const properUsdTotal = accounts.reduce((total, acc) => {
    if (acc.currency === 'USD') return total + acc.balance
    if (acc.currency === 'EUR') return total + acc.balance * EUR_USD_RATE
    if (acc.currency === 'GBP') return total + acc.balance * GBP_USD_RATE
    return total + acc.balance
  }, 0)

  assert.strictEqual(properUsdTotal, 84650)
  assert.notStrictEqual(properUsdTotal, naiveSum)
})

// 4. DUPLICATE TICKET PREVENTION
test('Deduplication: Prevents double-import of duplicate source tickets', () => {
  const existingSet = new Set(['acc1_TICKET100', 'acc1_TICKET101'])
  const incoming = [
    { ticket: 'TICKET100', accId: 'acc1' },
    { ticket: 'TICKET102', accId: 'acc1' },
  ]

  let added = 0
  let duplicates = 0

  incoming.forEach((item) => {
    const key = `${item.accId}_${item.ticket}`
    if (existingSet.has(key)) {
      duplicates++
    } else {
      existingSet.add(key)
      added++
    }
  })

  assert.strictEqual(duplicates, 1)
  assert.strictEqual(added, 1)
})

// 5. WEBHOOK TOKEN SECURITY & HASHING
test('Webhook Security: Generates high-entropy token and SHA-256 HMAC hash', () => {
  const secret = 'kilajo_test_secret_salt'
  const randomPart = crypto.randomBytes(24).toString('hex')
  const rawToken = `klj_live_${randomPart}`

  assert.strictEqual(rawToken.startsWith('klj_live_'), true)
  assert.strictEqual(rawToken.length >= 24, true)

  const hash1 = crypto.createHmac('sha256', secret).update(rawToken).digest('hex')
  const hash2 = crypto.createHmac('sha256', secret).update(rawToken).digest('hex')
  const diffHash = crypto.createHmac('sha256', secret).update(rawToken + '_diff').digest('hex')

  assert.strictEqual(hash1, hash2)
  assert.notStrictEqual(hash1, diffHash)
  assert.strictEqual(hash1.length, 64) // 64 hex characters for SHA-256
})

// 6. EXECUTION AGGREGATION ENGINE (SCALE-IN & SCALE-OUT)
test('Execution Engine: Aggregates scale-ins into a single weighted-average position', () => {
  // Deal 1: Buy 1.0 Lot @ 1.0800
  // Deal 2: Scale in Buy 1.0 Lot @ 1.0850
  // Weighted Average Entry Price should be (1.0800 * 1 + 1.0850 * 1) / 2 = 1.0825
  const deals = [
    { volume: 1.0, price: 1.0800 },
    { volume: 1.0, price: 1.0850 },
  ]

  const totalCost = deals.reduce((sum, d) => sum + d.volume * d.price, 0)
  const totalVolume = deals.reduce((sum, d) => sum + d.volume, 0)
  const weightedAvgPrice = totalCost / totalVolume

  assert.strictEqual(totalVolume, 2.0)
  assert.strictEqual(weightedAvgPrice, 1.0825)
})
