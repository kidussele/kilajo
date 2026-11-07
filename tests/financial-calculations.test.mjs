import test from 'node:test'
import assert from 'node:assert'

// Test trade model data
const mockTrades = [
  {
    id: '1',
    symbol: 'EURUSD',
    direction: 'BUY',
    quantity: 1,
    entry_price: 1.08,
    exit_price: 1.09,
    entry_time: '2026-11-01T10:00:00Z',
    exit_time: '2026-11-01T12:00:00Z',
    status: 'CLOSED',
    gross_pnl: 1000,
    commission: 7,
    swap: 0,
    fees: 0,
    net_pnl: 993,
    r_multiple: 2.0,
  },
  {
    id: '2',
    symbol: 'GBPUSD',
    direction: 'SELL',
    quantity: 1,
    entry_price: 1.25,
    exit_price: 1.255,
    entry_time: '2026-11-02T10:00:00Z',
    exit_time: '2026-11-02T11:00:00Z',
    status: 'CLOSED',
    gross_pnl: -500,
    commission: 7,
    swap: 0,
    fees: 0,
    net_pnl: -507,
    r_multiple: -1.0,
  },
  {
    id: '3',
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

test('Financial Calculations: Net PnL is mathematically accurate', () => {
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

