'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { useTrading } from '@/context/trading-context'

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
}

const COMMON_BROKERS = [
  'FTMO',
  'FundedNext',
  'The Funded Trader',
  'MFFX',
  'IC Markets',
  'Interactive Brokers',
  'OANDA',
  'Pepperstone',
  'Vantage',
  'Binance',
  'Bybit',
  'Other Broker',
]

const PLATFORMS = ['MetaTrader 5', 'MetaTrader 4', 'cTrader', 'TradingView', 'DXtrade', 'Manual Entry']

export function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const { createAccount } = useTrading()

  const [name, setName] = useState('')
  const [broker, setBroker] = useState('FTMO')
  const [platform, setPlatform] = useState('MetaTrader 5')
  const [accountType, setAccountType] = useState('Prop Challenge')
  const [currency, setCurrency] = useState('USD')
  const [initialBalance, setInitialBalance] = useState('100000')
  const [isPropFirm, setIsPropFirm] = useState(true)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please provide an account name.')
      return
    }

    const bal = parseFloat(initialBalance)
    if (isNaN(bal) || bal <= 0) {
      setError('Initial balance must be a valid positive amount.')
      return
    }

    await createAccount({
      user_id: 'default-user',
      name: name.trim(),
      broker,
      platform,
      account_type: accountType,
      currency,
      initial_balance: bal,
      current_balance: bal,
      is_prop_firm: isPropFirm,
      prop_firm_name: isPropFirm ? broker : null,
      is_active: true,
      connection_status: 'manual',
      last_synced_at: null,
    })

    setName('')
    setInitialBalance('100000')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Trading Account"
      description="Connect a broker or prop firm challenge to start tracking your trading performance."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive font-medium border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Account Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. FTMO $100k Challenge Phase 1"
            className="w-full rounded-md border bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-ring"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Broker / Prop Firm</label>
            <select
              value={broker}
              onChange={(e) => {
                setBroker(e.target.value)
                if (['FTMO', 'FundedNext', 'The Funded Trader', 'MFFX'].includes(e.target.value)) {
                  setIsPropFirm(true)
                  setAccountType('Prop Challenge')
                }
              }}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs"
            >
              {COMMON_BROKERS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Account Type</label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs"
            >
              <option value="Live">Live Real Money</option>
              <option value="Prop Challenge">Prop Firm Challenge</option>
              <option value="Prop Funded">Prop Firm Funded Account</option>
              <option value="Demo">Demo Practice</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Base Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Starting / Initial Balance *</label>
          <input
            type="number"
            step="any"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-1.5 text-xs font-mono tabular-nums"
            required
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="propFirmCheckbox"
            checked={isPropFirm}
            onChange={(e) => setIsPropFirm(e.target.checked)}
            className="rounded border-input text-primary focus:ring-ring"
          />
          <label htmlFor="propFirmCheckbox" className="text-xs font-medium text-foreground cursor-pointer">
            This is a Prop Firm Challenge (Enable drawdown & rule tracking)
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
            Create Account
          </Button>
        </div>
      </form>
    </Modal>
  )
}

