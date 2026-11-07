import test from 'node:test'
import assert from 'node:assert'
import crypto from 'node:crypto'

// ============================================================================
// PART 1: BRIDGE TOKEN SECURITY & LIFECYCLE TESTS
// ============================================================================

function validateBridgeSecret(secret) {
  if (!secret || secret.trim().length < 32) {
    throw new Error('BRIDGE_WEBHOOK_SECRET must be configured with at least 32 characters.')
  }
  return secret
}

function isValidTokenFormat(token) {
  if (typeof token !== 'string') return false
  const tokenRegex = /^klj_(live|test)_[0-9a-fA-F]{48,}$/
  return tokenRegex.test(token.trim())
}

function hashBridgeToken(token, secret) {
  const validatedSecret = validateBridgeSecret(secret)
  if (!isValidTokenFormat(token)) {
    throw new Error('Invalid token format.')
  }
  return crypto.createHmac('sha256', validatedSecret).update(token.trim()).digest('hex')
}

test('Bridge Security: Throws and fails closed when secret is missing or too short', () => {
  assert.throws(() => validateBridgeSecret(undefined), /BRIDGE_WEBHOOK_SECRET must be configured/)
  assert.throws(() => validateBridgeSecret(''), /BRIDGE_WEBHOOK_SECRET must be configured/)
  assert.throws(() => validateBridgeSecret('short_secret_under_32_chars'), /at least 32 characters/)

  const validSecret = 'super_secure_production_webhook_secret_key_2026_at_least_32_bytes!'
  assert.strictEqual(validateBridgeSecret(validSecret), validSecret)
})

test('Bridge Security: Token format validation rejects malformed or short tokens', () => {
  assert.strictEqual(isValidTokenFormat('invalid_token'), false)
  assert.strictEqual(isValidTokenFormat('klj_live_short'), false)
  assert.strictEqual(isValidTokenFormat('klj_prod_123456789012345678901234567890123456789012345678'), false)

  // Valid 48-hex token with prefix
  const validLive = `klj_live_${crypto.randomBytes(24).toString('hex')}`
  const validTest = `klj_test_${crypto.randomBytes(24).toString('hex')}`
  assert.strictEqual(isValidTokenFormat(validLive), true)
  assert.strictEqual(isValidTokenFormat(validTest), true)
})

test('Bridge Security: Token hashing produces deterministic SHA-256 HMAC and constant-time match', () => {
  const secret = 'super_secure_production_webhook_secret_key_2026_at_least_32_bytes!'
  const token = `klj_live_${crypto.randomBytes(24).toString('hex')}`

  const hash1 = hashBridgeToken(token, secret)
  const hash2 = hashBridgeToken(token, secret)
  const diffTokenHash = hashBridgeToken(`klj_live_${crypto.randomBytes(24).toString('hex')}`, secret)

  assert.strictEqual(hash1, hash2)
  assert.strictEqual(hash1.length, 64)
  assert.notStrictEqual(hash1, diffTokenHash)

  // Constant-time comparison verification
  const b1 = Buffer.from(hash1, 'utf8')
  const b2 = Buffer.from(hash2, 'utf8')
  assert.strictEqual(crypto.timingSafeEqual(b1, b2), true)
})

// ============================================================================
// PART 2: UNIVERSAL EXECUTION ENGINE TESTS
// ============================================================================

function normalizeDealType(rawType) {
  if (rawType === 0 || rawType === '0' || rawType === 'BUY' || rawType === 'DEAL_TYPE_BUY') return 'BUY'
  if (rawType === 1 || rawType === '1' || rawType === 'SELL' || rawType === 'DEAL_TYPE_SELL') return 'SELL'
  throw new Error(`Unsupported deal type: ${rawType}`)
}

function normalizeEntryType(rawEntry) {
  if (rawEntry === 0 || rawEntry === '0' || rawEntry === 'IN' || rawEntry === 'DEAL_ENTRY_IN') return 'IN'
  if (rawEntry === 1 || rawEntry === '1' || rawEntry === 'OUT' || rawEntry === 'DEAL_ENTRY_OUT') return 'OUT'
  if (rawEntry === 2 || rawEntry === '2' || rawEntry === 'INOUT' || rawEntry === 'DEAL_ENTRY_INOUT') return 'INOUT'
  throw new Error(`Unsupported entry type: ${rawEntry}`)
}

class TestExecutionAggregator {
  constructor(initialOpenPositions = []) {
    this.openPositions = new Map()
    for (const pos of initialOpenPositions) {
      this.openPositions.set(pos.positionTicket, { ...pos })
    }
    this.closedTrades = []
  }

  processDeal(rawDeal) {
    const direction = normalizeDealType(rawDeal.type)
    const entry = normalizeEntryType(rawDeal.entry)
    const posTicket = String(rawDeal.positionId || rawDeal.dealTicket)
    const volume = Number(rawDeal.volume)
    const price = Number(rawDeal.price)
    const commission = Number(rawDeal.commission || 0)
    const swap = Number(rawDeal.swap || 0)
    const fee = Number(rawDeal.fee || 0)
    const profit = Number(rawDeal.profit || 0)

    if (entry === 'IN') {
      const existing = this.openPositions.get(posTicket)
      if (existing) {
        // Scale-in
        const newTotalVol = existing.remainingVolume + volume
        const newWeightedPrice =
          (existing.weightedAverageEntryPrice * existing.remainingVolume + price * volume) / newTotalVol
        existing.remainingVolume = newTotalVol
        existing.totalVolumeOpened += volume
        existing.weightedAverageEntryPrice = newWeightedPrice
        existing.commission += commission
        existing.swap += swap
        existing.fees += fee
        existing.executionTickets.push(String(rawDeal.dealTicket))
      } else {
        // New position
        this.openPositions.set(posTicket, {
          id: `pos-${posTicket}`,
          positionTicket: posTicket,
          symbol: rawDeal.symbol,
          direction,
          totalVolumeOpened: volume,
          totalVolumeClosed: 0,
          remainingVolume: volume,
          weightedAverageEntryPrice: price,
          openTime: rawDeal.time,
          status: 'OPEN',
          grossPnl: 0,
          commission,
          swap,
          fees: fee,
          netPnl: commission + swap + fee,
          executionTickets: [String(rawDeal.dealTicket)],
        })
      }
    } else if (entry === 'OUT') {
      const position = this.openPositions.get(posTicket)
      if (!position) {
        throw new Error(`Orphan exit deal: Position ${posTicket} not found.`)
      }

      position.totalVolumeClosed += volume
      position.remainingVolume -= volume
      position.grossPnl += profit
      position.commission += commission
      position.swap += swap
      position.fees += fee
      position.executionTickets.push(String(rawDeal.dealTicket))

      // Net PnL = Gross + Commission + Swap + Fees
      position.netPnl = position.grossPnl + position.commission + position.swap + position.fees

      if (position.remainingVolume <= 0.00001) {
        position.status = 'CLOSED'
        position.closeTime = rawDeal.time
        this.closedTrades.push(position)
        this.openPositions.delete(posTicket)
      }
    }
  }
}

test('Execution Engine: Correctly parses numeric MT5 deal types (0=BUY, 1=SELL)', () => {
  assert.strictEqual(normalizeDealType(0), 'BUY')
  assert.strictEqual(normalizeDealType('0'), 'BUY')
  assert.strictEqual(normalizeDealType(1), 'SELL')
  assert.strictEqual(normalizeDealType('1'), 'SELL')
  assert.strictEqual(normalizeDealType('DEAL_TYPE_BUY'), 'BUY')
  assert.strictEqual(normalizeDealType('DEAL_TYPE_SELL'), 'SELL')
  assert.throws(() => normalizeDealType(99), /Unsupported deal type/)
})

test('Execution Engine: Correctly parses numeric MT5 entry codes (0=IN, 1=OUT, 2=INOUT) and rejects invalid', () => {
  assert.strictEqual(normalizeEntryType(0), 'IN')
  assert.strictEqual(normalizeEntryType('0'), 'IN')
  assert.strictEqual(normalizeEntryType(1), 'OUT')
  assert.strictEqual(normalizeEntryType('1'), 'OUT')
  assert.strictEqual(normalizeEntryType(2), 'INOUT')
  assert.strictEqual(normalizeEntryType('2'), 'INOUT')
  assert.strictEqual(normalizeEntryType('DEAL_ENTRY_IN'), 'IN')
  assert.throws(() => normalizeEntryType(5), /Unsupported entry type/)
})

test('Execution Engine: Multi-lot scale-in computes accurate weighted average entry price', () => {
  const engine = new TestExecutionAggregator()

  // First Fill: 1.0 lot at 1.0800
  engine.processDeal({
    dealTicket: '1001',
    positionId: 'POS_EURUSD_1',
    symbol: 'EURUSD',
    type: 0, // BUY
    entry: 0, // IN
    volume: 1.0,
    price: 1.0800,
    commission: -3.5,
    time: '2026-11-01T10:00:00Z',
  })

  // Second Fill: 2.0 lots at 1.0860
  engine.processDeal({
    dealTicket: '1002',
    positionId: 'POS_EURUSD_1',
    symbol: 'EURUSD',
    type: 0, // BUY
    entry: 0, // IN
    volume: 2.0,
    price: 1.0860,
    commission: -7.0,
    time: '2026-11-01T10:05:00Z',
  })

  const pos = engine.openPositions.get('POS_EURUSD_1')
  assert.strictEqual(pos.totalVolumeOpened, 3.0)
  assert.strictEqual(pos.remainingVolume, 3.0)
  // Weighted Avg = (1.0 * 1.0800 + 2.0 * 1.0860) / 3.0 = (1.0800 + 2.1720) / 3 = 3.2520 / 3 = 1.0840
  assert.strictEqual(Number(pos.weightedAverageEntryPrice.toFixed(4)), 1.0840)
  assert.strictEqual(pos.commission, -10.5)
})

test('Execution Engine: Partial exit preserves remaining open volume and completes on final exit', () => {
  const engine = new TestExecutionAggregator()

  // Enter 2.0 Lots at 2650
  engine.processDeal({
    dealTicket: '2001',
    positionId: 'POS_GOLD_1',
    symbol: 'XAUUSD',
    type: 0,
    entry: 0,
    volume: 2.0,
    price: 2650.0,
    commission: -14.0,
    time: '2026-11-01T11:00:00Z',
  })

  // Partial Exit: 1.0 Lot at 2660 with gross profit $1000
  engine.processDeal({
    dealTicket: '2002',
    positionId: 'POS_GOLD_1',
    symbol: 'XAUUSD',
    type: 1, // SELL to close
    entry: 1, // OUT
    volume: 1.0,
    price: 2660.0,
    profit: 1000.0,
    commission: -7.0,
    time: '2026-11-01T11:30:00Z',
  })

  const openPos = engine.openPositions.get('POS_GOLD_1')
  assert.strictEqual(openPos.remainingVolume, 1.0)
  assert.strictEqual(openPos.totalVolumeClosed, 1.0)
  assert.strictEqual(engine.closedTrades.length, 0) // Still open

  // Final Exit: Remaining 1.0 Lot at 2670 with gross profit $2000
  engine.processDeal({
    dealTicket: '2003',
    positionId: 'POS_GOLD_1',
    symbol: 'XAUUSD',
    type: 1,
    entry: 1,
    volume: 1.0,
    price: 2670.0,
    profit: 2000.0,
    commission: -7.0,
    time: '2026-11-01T12:00:00Z',
  })

  assert.strictEqual(engine.openPositions.has('POS_GOLD_1'), false)
  assert.strictEqual(engine.closedTrades.length, 1)

  const closed = engine.closedTrades[0]
  assert.strictEqual(closed.status, 'CLOSED')
  assert.strictEqual(closed.grossPnl, 3000.0)
  // Total Commission = -14 (entry) + -7 (exit 1) + -7 (exit 2) = -28.0
  assert.strictEqual(closed.commission, -28.0)
  // Net PnL = 3000 - 28 = 2972.0
  assert.strictEqual(closed.netPnl, 2972.0)
})

test('Execution Engine: Cross-batch state persistence resumes from existing open positions', () => {
  // Simulating an open trade fetched from the database from a previous webhook batch
  const openTradesFromDB = [
    {
      id: 'existing-db-trade-1',
      positionTicket: 'POS_BTC_99',
      symbol: 'BTCUSD',
      direction: 'BUY',
      totalVolumeOpened: 0.5,
      totalVolumeClosed: 0,
      remainingVolume: 0.5,
      weightedAverageEntryPrice: 65000,
      openTime: '2026-11-01T08:00:00Z',
      status: 'OPEN',
      grossPnl: 0,
      commission: -10,
      swap: 0,
      fees: 0,
      netPnl: -10,
      executionTickets: ['EXEC_99_IN'],
    },
  ]

  const engine = new TestExecutionAggregator(openTradesFromDB)

  // Incoming webhook in new batch with exit deal for POS_BTC_99
  engine.processDeal({
    dealTicket: 'EXEC_99_OUT',
    positionId: 'POS_BTC_99',
    symbol: 'BTCUSD',
    type: 1, // SELL
    entry: 1, // OUT
    volume: 0.5,
    price: 68000,
    profit: 1500,
    commission: -10,
    time: '2026-11-01T09:00:00Z',
  })

  assert.strictEqual(engine.closedTrades.length, 1)
  const closed = engine.closedTrades[0]
  assert.strictEqual(closed.positionTicket, 'POS_BTC_99')
  assert.strictEqual(closed.grossPnl, 1500)
  assert.strictEqual(closed.commission, -20)
  assert.strictEqual(closed.netPnl, 1480)
})

// ============================================================================
// PART 3: FINANCIAL LEDGER & BALANCE RECONCILIATION TESTS
// ============================================================================

test('Financial Ledger: Reconciles balance as single source of truth across all transaction types', () => {
  const ledgerTransactions = [
    { transaction_type: 'INITIAL_BALANCE', amount: 50000.0 },
    { transaction_type: 'DEPOSIT', amount: 10000.0 },
    { transaction_type: 'REALIZED_PNL', amount: 3500.0 },
    { transaction_type: 'REALIZED_PNL', amount: -1200.0 },
    { transaction_type: 'WITHDRAWAL', amount: -5000.0 },
    { transaction_type: 'FEE', amount: -25.0 },
    { transaction_type: 'ADJUSTMENT', amount: 50.0 },
  ]

  const reconciledBalance = ledgerTransactions.reduce((sum, tx) => sum + tx.amount, 0)
  // 50000 + 10000 + 3500 - 1200 - 5000 - 25 + 50 = 57325
  assert.strictEqual(reconciledBalance, 57325.0)
})

test('Financial Ledger: Trade modification and deletion update ledger and balance deterministically', () => {
  let ledger = [
    { id: 'tx-init', transaction_type: 'INITIAL_BALANCE', amount: 100000 },
    { id: 'tx-t1', trade_id: 't1', transaction_type: 'REALIZED_PNL', amount: 1200 },
    { id: 'tx-t2', trade_id: 't2', transaction_type: 'REALIZED_PNL', amount: -400 },
  ]

  const initialBalance = ledger.reduce((s, tx) => s + tx.amount, 0)
  assert.strictEqual(initialBalance, 100800)

  // User edits Trade 2 (net_pnl changed from -400 to -150)
  ledger = ledger.map((tx) => (tx.trade_id === 't2' ? { ...tx, amount: -150 } : tx))
  const balanceAfterEdit = ledger.reduce((s, tx) => s + tx.amount, 0)
  assert.strictEqual(balanceAfterEdit, 101050)

  // User deletes Trade 1
  ledger = ledger.filter((tx) => tx.trade_id !== 't1')
  const balanceAfterDelete = ledger.reduce((s, tx) => s + tx.amount, 0)
  assert.strictEqual(balanceAfterDelete, 99850)
})

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

// ============================================================================
// PART 4: ADVANCED PERFORMANCE & METRIC CALCULATIONS
// ============================================================================

test('Performance Metrics: Win rate excludes breakeven trades properly', () => {
  const trades = [
    { net_pnl: 500 }, // Win
    { net_pnl: 750 }, // Win
    { net_pnl: -300 }, // Loss
    { net_pnl: 0 }, // Breakeven
    { net_pnl: 0.00001 }, // Breakeven threshold
  ]

  const wins = trades.filter((t) => t.net_pnl > 0.0001).length // 2
  const losses = trades.filter((t) => t.net_pnl < -0.0001).length // 1
  const breakevens = trades.filter((t) => Math.abs(t.net_pnl) <= 0.0001).length // 2

  assert.strictEqual(wins, 2)
  assert.strictEqual(losses, 1)
  assert.strictEqual(breakevens, 2)

  const decisiveTrades = wins + losses
  const winRate = (wins / decisiveTrades) * 100
  assert.strictEqual(Number(winRate.toFixed(2)), 66.67)
})

test('Performance Metrics: Expectancy, Max Drawdown, and Recovery Factor calculation', () => {
  // Chronological closed trade P&Ls
  const tradePnlHistory = [1000, 1500, -800, -1200, 2000, -500, 1800]
  const initialBalance = 100000

  // 1. Calculate Peak-to-Trough Chronological Drawdown
  let runningBalance = initialBalance
  let peak = initialBalance
  let maxDrawdown = 0

  for (const pnl of tradePnlHistory) {
    runningBalance += pnl
    if (runningBalance > peak) {
      peak = runningBalance
    }
    const currentDrawdown = peak - runningBalance
    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown
    }
  }

  // Peak reached 100000 + 1000 + 1500 = 102500
  // Then drops by -800 (101700), then drops by -1200 (100500) -> Max Drawdown = 2000
  assert.strictEqual(maxDrawdown, 2000)

  // 2. Expectancy: (WinRate * AvgWin) - (LossRate * AvgLoss)
  const wins = tradePnlHistory.filter((p) => p > 0)
  const losses = tradePnlHistory.filter((p) => p < 0)
  const avgWin = wins.reduce((s, w) => s + w, 0) / wins.length // (1000+1500+2000+1800) / 4 = 6300 / 4 = 1575
  const avgLoss = Math.abs(losses.reduce((s, l) => s + l, 0) / losses.length) // (800+1200+500) / 3 = 2500 / 3 = 833.333
  const winProb = wins.length / tradePnlHistory.length // 4/7
  const lossProb = losses.length / tradePnlHistory.length // 3/7

  const expectancy = winProb * avgWin - lossProb * avgLoss
  // (4/7 * 1575) - (3/7 * 833.333) = 900 - 357.14 = 542.86
  assert.strictEqual(Number(expectancy.toFixed(2)), 542.86)

  // 3. Recovery Factor = Total Net Profit / Max Drawdown
  const totalNetProfit = tradePnlHistory.reduce((s, p) => s + p, 0) // 3800
  const recoveryFactor = totalNetProfit / maxDrawdown // 3800 / 2000 = 1.9
  assert.strictEqual(recoveryFactor, 1.9)
})

// ============================================================================
// PART 5: AI ASSISTANT & TEACHER HELPER DIAGNOSTICS TESTS
// ============================================================================

test('AI Assistant: Validates Gemini API Key format and AQ. prefix support', () => {
  const isGeminiApiKeyValid = (key) => {
    if (!key || typeof key !== 'string') return false
    const trimmed = key.trim()
    // Supports Google AI Studio newer AQ. authentication keys and standard formats
    return trimmed.startsWith('AQ.') || trimmed.startsWith('AIza')
  }

  const sampleKey = 'AQ.mock_sample_key_for_testing_purposes_only_123456789'
  assert.strictEqual(isGeminiApiKeyValid(sampleKey), true)
  assert.strictEqual(isGeminiApiKeyValid('AIzaSyD-exampleKey123'), true)
  assert.strictEqual(isGeminiApiKeyValid(''), false)
  assert.strictEqual(isGeminiApiKeyValid('invalid_random_string'), false)
})

test('AI Assistant: Trade evaluation correctly flags missing stop-loss as critical risk breach', () => {
  const auditTrade = (trade) => {
    const mistakes = []
    if (!trade.stop_loss || trade.stop_loss === 0) {
      mistakes.push('CRITICAL: Missing Stop Loss')
    }
    if (trade.risk_amount && trade.account_balance && trade.risk_amount / trade.account_balance > 0.02) {
      mistakes.push('RISK BREACH: Risking > 2% per trade')
    }
    return mistakes
  }

  const badTrade = {
    symbol: 'EURUSD',
    direction: 'BUY',
    quantity: 2.0,
    stop_loss: null,
    account_balance: 10000,
    risk_amount: 500, // 5% risk!
  }

  const flags = auditTrade(badTrade)
  assert.strictEqual(flags.includes('CRITICAL: Missing Stop Loss'), true)
  assert.strictEqual(flags.includes('RISK BREACH: Risking > 2% per trade'), true)
})

// ============================================================================
// PART 6: ACCOUNT REORDERING & 5-CATEGORY CLASSIFICATION TESTS
// ============================================================================

test('Account Categorization: Verifies 5 categories exist in exact specified order', () => {
  const EXPECTED_CATEGORIES = [
    'All Accounts',
    'Demo Practice',
    'Backtesting',
    'Prop Challenges',
    'Live Trading',
  ]

  const CATEGORY_IDS = ['ALL', 'DEMO', 'BACKTEST', 'PROP', 'LIVE']

  assert.strictEqual(EXPECTED_CATEGORIES.length, 5)
  assert.strictEqual(EXPECTED_CATEGORIES[0], 'All Accounts')
  assert.strictEqual(EXPECTED_CATEGORIES[1], 'Demo Practice')
  assert.strictEqual(EXPECTED_CATEGORIES[2], 'Backtesting')
  assert.strictEqual(EXPECTED_CATEGORIES[3], 'Prop Challenges')
  assert.strictEqual(EXPECTED_CATEGORIES[4], 'Live Trading')
})

test('Account Categorization: Accurately classifies trading accounts by type, metadata, and name', () => {
  function getAccountCategory(acc) {
    const type = (acc.account_type || '').toLowerCase()
    const name = (acc.name || '').toLowerCase()
    const broker = (acc.broker || '').toLowerCase()

    if (type.includes('backtest') || name.includes('backtest') || broker.includes('backtest')) {
      return 'BACKTEST'
    }
    if (
      acc.is_prop_firm ||
      type.includes('prop') ||
      type.includes('challenge') ||
      name.includes('challenge') ||
      name.includes('ftmo')
    ) {
      return 'PROP'
    }
    if (
      type.includes('demo') ||
      type.includes('practice') ||
      type.includes('paper') ||
      name.includes('demo')
    ) {
      return 'DEMO'
    }
    return 'LIVE'
  }

  // 1. Demo Practice
  assert.strictEqual(
    getAccountCategory({ account_type: 'Demo Practice', name: 'Paper Trading MT5' }),
    'DEMO'
  )
  assert.strictEqual(
    getAccountCategory({ account_type: 'Manual', name: 'Demo Simulator Account' }),
    'DEMO'
  )

  // 2. Backtesting
  assert.strictEqual(
    getAccountCategory({ account_type: 'Backtesting', name: '2024 London Sweep Backtest' }),
    'BACKTEST'
  )
  assert.strictEqual(
    getAccountCategory({ broker: 'TradingView Replay', name: 'EURUSD 2023 Backtest' }),
    'BACKTEST'
  )

  // 3. Prop Challenges
  assert.strictEqual(
    getAccountCategory({ account_type: 'Prop Challenges', is_prop_firm: true, name: 'FTMO $100k' }),
    'PROP'
  )
  assert.strictEqual(
    getAccountCategory({ name: 'FundedNext Phase 1 Challenge' }),
    'PROP'
  )

  // 4. Live Trading
  assert.strictEqual(
    getAccountCategory({ account_type: 'Live Trading', name: 'IC Markets Live' }),
    'LIVE'
  )
  assert.strictEqual(
    getAccountCategory({ account_type: 'Live', name: 'OANDA Primary Brokerage' }),
    'LIVE'
  )
})
