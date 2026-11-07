'use client'

import React, { useState, useRef } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useTrading } from '@/context/trading-context'
import { CsvAdapter, ColumnMapping } from '@/lib/adapters/csv-adapter'
import { NormalizedTrade, ValidationIssue } from '@/lib/adapters/base-adapter'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Download,
  RefreshCw,
  Sliders,
  Check,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function ImportPage() {
  const { accounts, bulkAddTrades, activeAccountId } = useTrading()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedAccountId, setSelectedAccountId] = useState(
    activeAccountId !== 'ALL' ? activeAccountId : accounts[0]?.id || ''
  )
  const [file, setFile] = useState<File | null>(null)
  const [csvContent, setCsvContent] = useState<string>('')
  const [headers, setHeaders] = useState<string[]>([])
  const [rawRecords, setRawRecords] = useState<any[]>([])
  const [mapping, setMapping] = useState<Partial<ColumnMapping>>({})

  // Parsing & validation states
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1) // 1: Upload, 2: Map, 3: Preview & Validate, 4: Success Summary
  const [normalizedTrades, setNormalizedTrades] = useState<NormalizedTrade[]>([])
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])
  const [importSummary, setImportSummary] = useState<{ added: number; duplicates: number } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const adapter = new CsvAdapter()

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    setFile(selected)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const text = event.target?.result as string
      setCsvContent(text)

      try {
        const records = await adapter.parse(text)
        if (records.length > 0) {
          const hdrs = Object.keys(records[0])
          setHeaders(hdrs)
          setRawRecords(records)
          const autoMap = adapter.detectMapping(hdrs)
          setMapping(autoMap)
          setStep(2)
        }
      } catch (err) {
        console.error('Failed to parse CSV:', err)
      }
    }
    reader.readAsText(selected)
  }

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      const fakeEvent = {
        target: { files: [droppedFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFileChange(fakeEvent)
    }
  }

  // Perform validation on mapped columns
  const handleProceedToValidation = () => {
    setIsProcessing(true)
    const result = adapter.normalize(rawRecords, mapping)
    setNormalizedTrades(result.trades)
    setValidationIssues(result.issues)
    setIsProcessing(false)
    setStep(3)
  }

  // Commit imported trades to journal
  const handleCommitImport = () => {
    if (!selectedAccountId) return
    setIsProcessing(true)

    const payload = normalizedTrades.map((t) => ({
      user_id: 'default-user',
      account_id: selectedAccountId,
      strategy_id: null,
      symbol: t.symbol,
      direction: t.direction,
      quantity: t.quantity,
      entry_price: t.entryPrice,
      exit_price: t.exitPrice || null,
      stop_loss: t.stopLoss || null,
      take_profit: t.takeProfit || null,
      entry_time: t.entryTime,
      exit_time: t.exitTime || null,
      status: t.status,
      gross_pnl: t.grossPnl,
      commission: t.commission,
      swap: t.swap,
      fees: t.fees,
      net_pnl: t.netPnl,
      pnl_percentage: 0,
      risk_amount: null,
      r_multiple: null,
      session: t.session || null,
      emotion_before: null,
      emotion_during: null,
      emotion_after: null,
      discipline_rating: null,
      mistakes: null,
      notes: t.notes || `Imported from ${file?.name}`,
      source: 'CSV_IMPORT',
      source_ticket: t.sourceTicket || null,
    }))

    const summary = bulkAddTrades(payload)
    setImportSummary(summary)
    setIsProcessing(false)
    setStep(4)
  }

  // Sample CSV template download
  const handleDownloadSample = () => {
    const csvContent =
      'Ticket,Open Time,Type,Size,Item,Open Price,S / L,T / P,Close Time,Close Price,Commission,Swap,Profit\n' +
      '892301,2026-11-01 08:30:00,buy,1.00,EURUSD,1.08200,1.07900,1.08700,2026-11-01 14:15:00,1.08700,-7.00,0.00,500.00\n' +
      '892302,2026-11-02 13:45:00,sell,2.00,NAS100,19800.00,19850.00,19700.00,2026-11-02 17:00:00,19710.00,-15.00,-5.00,360.00\n' +
      '892303,2026-11-03 09:15:00,buy,0.50,XAUUSD,2690.00,2685.00,2705.00,2026-11-03 11:20:00,2685.00,-5.00,0.00,-250.00\n'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'kilajo_sample_statement.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
              IMPORT CENTER
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              5-step universal statement normalization and duplicate detection engine
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={handleDownloadSample} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            <span>Download Sample CSV</span>
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs font-medium px-2 py-3 rounded-xl border bg-card">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
            <span className="h-6 w-6 rounded-full border flex items-center justify-center text-xs">1</span>
            <span>Upload File</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
            <span className="h-6 w-6 rounded-full border flex items-center justify-center text-xs">2</span>
            <span>Map Columns</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
            <span className="h-6 w-6 rounded-full border flex items-center justify-center text-xs">3</span>
            <span>Validate & Preview</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
          <div className={`flex items-center gap-2 ${step >= 4 ? 'text-emerald-600 font-bold' : 'text-muted-foreground'}`}>
            <span className="h-6 w-6 rounded-full border flex items-center justify-center text-xs">4</span>
            <span>Import Summary</span>
          </div>
        </div>

        {/* STEP 1: Upload */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Target Account Selector */}
            <div className="p-4 rounded-xl border bg-card space-y-2">
              <label className="text-xs font-semibold text-foreground">Select Target Trading Account *</label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-xs font-medium"
              >
                {accounts.length === 0 ? (
                  <option value="">No accounts available. Create an account first.</option>
                ) : (
                  accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.broker} - {acc.currency})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 hover:bg-muted/10 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .tsv, .txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-primary mb-3">
                <UploadCloud className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Click to upload or drag & drop statement</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Supports MetaTrader 4/5 reports, cTrader statements, TradingView export, and broker CSV files.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Map Columns */}
        {step === 2 && (
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold tracking-tight uppercase font-mono flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                <span>Map External Columns to KILAJO Fields</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                We auto-detected columns from your file ({file?.name}). Confirm or adjust below.
              </p>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Symbol */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Symbol / Instrument *</label>
                  <select
                    value={mapping.symbol || ''}
                    onChange={(e) => setMapping({ ...mapping, symbol: e.target.value })}
                    className="w-full rounded border bg-background px-3 py-1.5"
                  >
                    <option value="">-- Select Column --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Direction */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Direction (Buy/Sell) *</label>
                  <select
                    value={mapping.direction || ''}
                    onChange={(e) => setMapping({ ...mapping, direction: e.target.value })}
                    className="w-full rounded border bg-background px-3 py-1.5"
                  >
                    <option value="">-- Select Column --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Quantity / Volume / Lots *</label>
                  <select
                    value={mapping.quantity || ''}
                    onChange={(e) => setMapping({ ...mapping, quantity: e.target.value })}
                    className="w-full rounded border bg-background px-3 py-1.5"
                  >
                    <option value="">-- Select Column --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Entry Price */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Entry Price *</label>
                  <select
                    value={mapping.entryPrice || ''}
                    onChange={(e) => setMapping({ ...mapping, entryPrice: e.target.value })}
                    className="w-full rounded border bg-background px-3 py-1.5"
                  >
                    <option value="">-- Select Column --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Exit Price */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Exit Price</label>
                  <select
                    value={mapping.exitPrice || ''}
                    onChange={(e) => setMapping({ ...mapping, exitPrice: e.target.value })}
                    className="w-full rounded border bg-background px-3 py-1.5"
                  >
                    <option value="">-- None / Open Position --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Open Time */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Entry Time / Date *</label>
                  <select
                    value={mapping.entryTime || ''}
                    onChange={(e) => setMapping({ ...mapping, entryTime: e.target.value })}
                    className="w-full rounded border bg-background px-3 py-1.5"
                  >
                    <option value="">-- Select Column --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Close Time */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Exit Time / Close Date</label>
                  <select
                    value={mapping.exitTime || ''}
                    onChange={(e) => setMapping({ ...mapping, exitTime: e.target.value })}
                    className="w-full rounded border bg-background px-3 py-1.5"
                  >
                    <option value="">-- None --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Profit */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Net P&L / Profit</label>
                  <select
                    value={mapping.netPnl || ''}
                    onChange={(e) => setMapping({ ...mapping, netPnl: e.target.value })}
                    className="w-full rounded border bg-background px-3 py-1.5"
                  >
                    <option value="">-- Select Column --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Ticket ID */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Ticket / Order ID (For Deduplication)</label>
                  <select
                    value={mapping.ticket || ''}
                    onChange={(e) => setMapping({ ...mapping, ticket: e.target.value })}
                    className="w-full rounded border bg-background px-3 py-1.5"
                  >
                    <option value="">-- None --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button size="sm" onClick={handleProceedToValidation} disabled={!mapping.symbol || !mapping.entryPrice}>
                  Validate Data ({rawRecords.length} Rows)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Preview & Validate */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-mono text-foreground uppercase">
                  Data Normalization & Validation Results
                </h3>
                <p className="text-xs text-muted-foreground">
                  {normalizedTrades.length} valid trade records ready for import.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                  Adjust Mapping
                </Button>
                <Button size="sm" onClick={handleCommitImport} className="bg-primary text-primary-foreground font-semibold">
                  Confirm & Import {normalizedTrades.length} Trades
                </Button>
              </div>
            </div>

            {/* Validation Issues Alert */}
            {validationIssues.length > 0 && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs dark:bg-amber-950/30 dark:border-amber-900/40">
                <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-200">
                  <AlertCircle className="h-4 w-4" />
                  <span>{validationIssues.length} rows skipped due to invalid data format</span>
                </div>
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto font-mono text-[11px] text-amber-700 dark:text-amber-300">
                  {validationIssues.slice(0, 5).map((iss, i) => (
                    <div key={i}>Row #{iss.row}: {iss.message}</div>
                  ))}
                  {validationIssues.length > 5 && <div>...and {validationIssues.length - 5} more issues</div>}
                </div>
              </div>
            )}

            {/* Preview Table */}
            <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-muted/40 text-muted-foreground font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Ticket</th>
                      <th className="py-2.5 px-3">Direction</th>
                      <th className="py-2.5 px-3">Symbol</th>
                      <th className="py-2.5 px-3">Lots</th>
                      <th className="py-2.5 px-3">Entry Price</th>
                      <th className="py-2.5 px-3">Exit Price</th>
                      <th className="py-2.5 px-3">Net P&L</th>
                      <th className="py-2.5 px-3">Session</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {normalizedTrades.slice(0, 10).map((t, idx) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="py-2 px-3 font-mono text-muted-foreground">{t.sourceTicket || '—'}</td>
                        <td className="py-2 px-3 font-bold">{t.direction}</td>
                        <td className="py-2 px-3 font-mono font-semibold">{t.symbol}</td>
                        <td className="py-2 px-3 font-mono">{t.quantity}</td>
                        <td className="py-2 px-3 font-mono">{t.entryPrice}</td>
                        <td className="py-2 px-3 font-mono">{t.exitPrice ?? '—'}</td>
                        <td className="py-2 px-3 font-mono font-bold">
                          <span className={t.netPnl >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                            {formatCurrency(t.netPnl, 'USD', true)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">{t.session}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {normalizedTrades.length > 10 && (
                <div className="p-2 border-t text-center text-xs text-muted-foreground italic">
                  Showing first 10 of {normalizedTrades.length} normalized trades
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Success Summary */}
        {step === 4 && importSummary && (
          <Card className="shadow-xs text-center p-8">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold font-mono text-foreground">Import Completed Successfully</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Your trades have been normalized and committed to your account trading journal.
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto my-6 p-4 rounded-xl border bg-muted/20 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Trades Imported</span>
                <span className="font-mono text-lg font-bold text-emerald-600">+{importSummary.added}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Duplicates Filtered</span>
                <span className="font-mono text-lg font-bold text-muted-foreground">{importSummary.duplicates}</span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStep(1)
                  setFile(null)
                  setNormalizedTrades([])
                  setImportSummary(null)
                }}
              >
                Import Another File
              </Button>
              <Button
                size="sm"
                onClick={() => (window.location.href = '/journal')}
                className="bg-primary text-primary-foreground font-semibold"
              >
                Go to Trading Journal
              </Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
