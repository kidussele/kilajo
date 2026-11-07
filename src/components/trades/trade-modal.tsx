'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Trade } from '@/types/trading'
import { useTrading } from '@/context/trading-context'

interface TradeModalProps {
  isOpen: boolean
  onClose: () => void
  tradeToEdit?: Trade | null
}

const COMMON_MISTAKES = [
  'FOMO Entry',
  'Moved Stop Loss',
  'Overleveraged',
  'Revenge Trade',
  'Early Exit',
  'Chased Market',
  'Trading Outside Strategy',
  'Ignored Risk Limit',
]

const SESSIONS = ['London', 'New York', 'London/NY Overlap', 'Asian']
const EMOTIONS = ['Calm', 'Confident', 'Patient', 'Anxious', 'Fearful', 'Greedy', 'Bored', 'Rushed', 'Frustrated', 'Relieved']

export function TradeModal({ isOpen, onClose, tradeToEdit }: TradeModalProps) {
  const { accounts, strategies, addTrade, updateTrade, activeAccountId } = useTrading()

  const [accountId, setAccountId] = useState('')
  const [symbol, setSymbol] = useState('EURUSD')
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY')
  const [quantity, setQuantity] = useState('1.0')
  const [entryPrice, setEntryPrice] = useState('')
  const [exitPrice, setExitPrice] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const [entryTime, setEntryTime] = useState(new Date().toISOString().slice(0, 16))
  const [exitTime, setExitTime] = useState(new Date().toISOString().slice(0, 16))
  const [status, setStatus] = useState<'OPEN' | 'CLOSED'>('CLOSED')
  const [strategyId, setStrategyId] = useState('')
  const [session, setSession] = useState('London')
  const [commission, setCommission] = useState('7.00')
  const [swap, setSwap] = useState('0.00')
  const [grossPnl, setGrossPnl] = useState('')
  const [netPnl, setNetPnl] = useState('')
  const [riskAmount, setRiskAmount] = useState('')
  const [rMultiple, setRMultiple] = useState('')
  const [emotionBefore, setEmotionBefore] = useState('Calm')
  const [emotionAfter, setEmotionAfter] = useState('Satisfied')
  const [disciplineRating, setDisciplineRating] = useState(5)
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  // Prefill when editing or opening
  useEffect(() => {
    if (tradeToEdit) {
      setAccountId(tradeToEdit.account_id)
      setSymbol(tradeToEdit.symbol)
      setDirection(tradeToEdit.direction)
      setQuantity(String(tradeToEdit.quantity))
      setEntryPrice(String(tradeToEdit.entry_price))
      setExitPrice(tradeToEdit.exit_price ? String(tradeToEdit.exit_price) : '')
      setStopLoss(tradeToEdit.stop_loss ? String(tradeToEdit.stop_loss) : '')
      setTakeProfit(tradeToEdit.take_profit ? String(tradeToEdit.take_profit) : '')
      setEntryTime(tradeToEdit.entry_time.slice(0, 16))
      setExitTime(tradeToEdit.exit_time ? tradeToEdit.exit_time.slice(0, 16) : new Date().toISOString().slice(0, 16))
      setStatus(tradeToEdit.status as 'OPEN' | 'CLOSED')
      setStrategyId(tradeToEdit.strategy_id || '')
      setSession(tradeToEdit.session || 'London')
      setCommission(String(tradeToEdit.commission || '0'))
      setSwap(String(tradeToEdit.swap || '0'))
      setGrossPnl(String(tradeToEdit.gross_pnl || '0'))
      setNetPnl(String(tradeToEdit.net_pnl || '0'))
      setRiskAmount(tradeToEdit.risk_amount ? String(tradeToEdit.risk_amount) : '')
      setRMultiple(tradeToEdit.r_multiple ? String(tradeToEdit.r_multiple) : '')
      setEmotionBefore(tradeToEdit.emotion_before || 'Calm')
      setEmotionAfter(tradeToEdit.emotion_after || 'Satisfied')
      setDisciplineRating(tradeToEdit.discipline_rating || 5)
      setSelectedMistakes(tradeToEdit.mistakes || [])
      setNotes(tradeToEdit.notes || '')
    } else {
      // Default to active account or first available
      const defaultAcc = activeAccountId !== 'ALL' && !activeAccountId.startsWith('CAT:')
        ? activeAccountId
        : accounts[0]?.id || ''
      setAccountId(defaultAcc)
      setSymbol('EURUSD')
      setDirection('BUY')
      setQuantity('1.0')
      setEntryPrice('1.08500')
      setExitPrice('1.08900')
      setStopLoss('1.08300')
      setTakeProfit('1.09000')
      setGrossPnl('400.00')
      setNetPnl('393.00')
      setRiskAmount('200.00')
      setRMultiple('2.0')
      setSelectedMistakes([])
      setNotes('')
      setError('')
    }
  }, [tradeToEdit, isOpen, accounts, activeAccountId])

  // Auto-calculate Net PnL when Gross, Commission, Swap change
  const handleGrossChange = (val: string) => {
    setGrossPnl(val)
    const gross = parseFloat(val) || 0
    const comm = parseFloat(commission) || 0
    const sw = parseFloat(swap) || 0
    const net = gross - comm - sw
    setNetPnl(net.toFixed(2))
  }

  const toggleMistake = (mistake: string) => {
    setSelectedMistakes((prev) =>
      prev.includes(mistake) ? prev.filter((m) => m !== mistake) : [...prev, mistake]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!accountId) {
      setError('Please select or create a trading account first.')
      return
    }
    if (!symbol) {
      setError('Symbol is required.')
      return
    }
    const numEntry = parseFloat(entryPrice)
    const numQty = parseFloat(quantity)
    if (isNaN(numEntry) || numEntry <= 0) {
      setError('Entry price must be a valid positive number.')
      return
    }
    if (isNaN(numQty) || numQty <= 0) {
      setError('Quantity/Lots must be greater than zero.')
      return
    }

    const net = status === 'CLOSED' ? (parseFloat(netPnl) || 0) : 0
    const gross = status === 'CLOSED' ? (parseFloat(grossPnl) || 0) : 0
    const comm = parseFloat(commission) || 0
    const sw = parseFloat(swap) || 0
    const risk = parseFloat(riskAmount) || undefined
    const rMult = parseFloat(rMultiple) || undefined

    const payload = {
      user_id: 'default-user',
      account_id: accountId,
      strategy_id: strategyId || null,
      symbol: symbol.toUpperCase().trim(),
      direction,
      quantity: numQty,
      entry_price: numEntry,
      exit_price: status === 'CLOSED' && exitPrice ? parseFloat(exitPrice) : null,
      stop_loss: stopLoss ? parseFloat(stopLoss) : null,
      take_profit: takeProfit ? parseFloat(takeProfit) : null,
      entry_time: new Date(entryTime).toISOString(),
      exit_time: status === 'CLOSED' ? new Date(exitTime).toISOString() : null,
      status,
      gross_pnl: gross,
      commission: comm,
      swap: sw,
      fees: 0,
      net_pnl: net,
      pnl_percentage: 0,
      risk_amount: risk || null,
      r_multiple: rMult || null,
      session,
      emotion_before: emotionBefore,
      emotion_during: null,
      emotion_after: emotionAfter,
      discipline_rating: disciplineRating,
      mistakes: selectedMistakes,
      notes: notes || null,
      source: 'MANUAL',
      source_ticket: tradeToEdit?.source_ticket || `MANUAL-${Date.now()}`,
    }

    if (tradeToEdit) {
      await updateTrade(tradeToEdit.id, payload)
    } else {
      await addTrade(payload)
    }

    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tradeToEdit ? 'Edit Trade' : 'Log New Trade'}
      description="Record complete trade execution, metrics, risk, and psychological notes."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive font-medium border border-destructive/20">
            {error}
          </div>
        )}

        {/* Account & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Trading Account *</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-ring"
              required
            >
              <option value="" disabled>Select Account</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.broker})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Symbol / Pair *</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g. EURUSD, NAS100"
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs font-mono font-medium focus:ring-1 focus:ring-ring uppercase"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Direction *</label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setDirection('BUY')}
                className={`py-1.5 text-xs font-bold rounded border transition-colors ${
                  direction === 'BUY'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-background hover:bg-accent text-foreground'
                }`}
              >
                BUY / LONG
              </button>
              <button
                type="button"
                onClick={() => setDirection('SELL')}
                className={`py-1.5 text-xs font-bold rounded border transition-colors ${
                  direction === 'SELL'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-background hover:bg-accent text-foreground'
                }`}
              >
                SELL / SHORT
              </button>
            </div>
          </div>
        </div>

        {/* Pricing & Execution */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Quantity / Lots *</label>
            <input
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs font-mono tabular-nums"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Entry Price *</label>
            <input
              type="number"
              step="any"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs font-mono tabular-nums"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Exit Price</label>
            <input
              type="number"
              step="any"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              disabled={status === 'OPEN'}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs font-mono tabular-nums disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Trade Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'OPEN' | 'CLOSED')}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs"
            >
              <option value="CLOSED">CLOSED</option>
              <option value="OPEN">OPEN</option>
            </select>
          </div>
        </div>

        {/* Risk & Target */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Stop Loss</label>
            <input
              type="number"
              step="any"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs font-mono tabular-nums"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Take Profit</label>
            <input
              type="number"
              step="any"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs font-mono tabular-nums"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Risk Amount ($)</label>
            <input
              type="number"
              step="any"
              value={riskAmount}
              onChange={(e) => setRiskAmount(e.target.value)}
              placeholder="200.00"
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs font-mono tabular-nums"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">R-Multiple</label>
            <input
              type="number"
              step="any"
              value={rMultiple}
              onChange={(e) => setRMultiple(e.target.value)}
              placeholder="2.0"
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs font-mono tabular-nums"
            />
          </div>
        </div>

        {/* PnL & Fees */}
        {status === 'CLOSED' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/20 p-3 rounded-lg border">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Gross P&L ($)</label>
              <input
                type="number"
                step="any"
                value={grossPnl}
                onChange={(e) => handleGrossChange(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-md border bg-background px-3 py-1.5 text-xs font-mono tabular-nums"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Commission ($)</label>
              <input
                type="number"
                step="any"
                value={commission}
                onChange={(e) => {
                  setCommission(e.target.value)
                  const gross = parseFloat(grossPnl) || 0
                  const comm = parseFloat(e.target.value) || 0
                  const sw = parseFloat(swap) || 0
                  setNetPnl((gross - comm - sw).toFixed(2))
                }}
                className="w-full rounded-md border bg-background px-3 py-1.5 text-xs font-mono tabular-nums"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Swap ($)</label>
              <input
                type="number"
                step="any"
                value={swap}
                onChange={(e) => {
                  setSwap(e.target.value)
                  const gross = parseFloat(grossPnl) || 0
                  const comm = parseFloat(commission) || 0
                  const sw = parseFloat(e.target.value) || 0
                  setNetPnl((gross - comm - sw).toFixed(2))
                }}
                className="w-full rounded-md border bg-background px-3 py-1.5 text-xs font-mono tabular-nums"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Net P&L ($) *</label>
              <input
                type="number"
                step="any"
                value={netPnl}
                onChange={(e) => setNetPnl(e.target.value)}
                className={`w-full rounded-md border px-3 py-1.5 text-xs font-mono font-bold tabular-nums ${
                  parseFloat(netPnl) >= 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' : 'text-red-600 bg-red-50 dark:bg-red-950/30'
                }`}
                required
              />
            </div>
          </div>
        )}

        {/* Timestamps & Strategy */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Entry Time *</label>
            <input
              type="datetime-local"
              value={entryTime}
              onChange={(e) => setEntryTime(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Exit Time</label>
            <input
              type="datetime-local"
              value={exitTime}
              onChange={(e) => setExitTime(e.target.value)}
              disabled={status === 'OPEN'}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Strategy</label>
            <select
              value={strategyId}
              onChange={(e) => setStrategyId(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs"
            >
              <option value="">No Strategy Assigned</option>
              {strategies.map((strat) => (
                <option key={strat.id} value={strat.id}>
                  {strat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Behavioral & Psychology */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t pt-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Session</label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs"
            >
              {SESSIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Emotion Before</label>
            <select
              value={emotionBefore}
              onChange={(e) => setEmotionBefore(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs"
            >
              {EMOTIONS.map((em) => (
                <option key={em} value={em}>{em}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Emotion After</label>
            <select
              value={emotionAfter}
              onChange={(e) => setEmotionAfter(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs"
            >
              {EMOTIONS.map((em) => (
                <option key={em} value={em}>{em}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Discipline (1-5)</label>
            <select
              value={disciplineRating}
              onChange={(e) => setDisciplineRating(parseInt(e.target.value))}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs"
            >
              <option value={5}>5 - Flawless Execution</option>
              <option value={4}>4 - Good Discipline</option>
              <option value={3}>3 - Minor Rule Hesitation</option>
              <option value={2}>2 - Broke Core Rules</option>
              <option value={1}>1 - Complete Indiscipline</option>
            </select>
          </div>
        </div>

        {/* Mistakes Tags */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Tag Any Mistakes</label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_MISTAKES.map((mistake) => {
              const isSelected = selectedMistakes.includes(mistake)
              return (
                <button
                  key={mistake}
                  type="button"
                  onClick={() => toggleMistake(mistake)}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                    isSelected
                      ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-300 font-semibold'
                      : 'bg-background hover:bg-accent text-muted-foreground'
                  }`}
                >
                  {mistake}
                </button>
              )
            })}
          </div>
        </div>

        {/* Trade Notes */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Trade Notes & Reflections</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Why did you take this setup? What was the context? Any lessons?"
            className="w-full rounded-md border bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
            {tradeToEdit ? 'Save Changes' : 'Record Trade'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

