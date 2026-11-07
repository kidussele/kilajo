'use client'

import React, { useState, useRef } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useTrading } from '@/context/trading-context'
import { CsvAdapter, ColumnMapping } from '@/lib/adapters/csv-adapter'
import { NormalizedTrade, ValidationIssue } from '@/lib/adapters/base-adapter'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PageHeroBanner } from '@/components/ui/page-hero-banner'
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
  FileText,
  MapPin,
  BarChart3,
  Database,
  Briefcase,
  ChevronDown,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'

export default function ImportPage() {
  const { accounts, bulkAddTrades, activeAccountId } = useTrading()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedAccountId, setSelectedAccountId] = useState(
    activeAccountId !== 'ALL' && !activeAccountId.startsWith('CAT:')
      ? activeAccountId
      : accounts[0]?.id || ''
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
  const [fileError, setFileError] = useState<string | null>(null)

  const adapter = new CsvAdapter()
  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB limit

  // Handle file select with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const selected = e.target.files?.[0]
    if (!selected) return

    // 1. File size check
    if (selected.size > MAX_FILE_SIZE_BYTES) {
      setFileError('File size exceeds the 10MB limit. Please upload a smaller statement file.')
      return
    }

    // 2. Extension check
    const validExtensions = ['.csv', '.tsv', '.txt']
    const hasValidExt = validExtensions.some((ext) => selected.name.toLowerCase().endsWith(ext))
    if (!hasValidExt) {
      setFileError('Unsupported file format. Please upload a valid CSV, TSV, or TXT file.')
      return
    }

    setFile(selected)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const text = event.target?.result as string
      setCsvContent(text)

      try {
        const records = await adapter.parse(text)
        if (records.length === 0) {
          setFileError('The uploaded file is empty or contains no parseable trade rows.')
          return
        }
        const hdrs = Object.keys(records[0])
        setHeaders(hdrs)
        setRawRecords(records)
        const autoMap = adapter.detectMapping(hdrs)
        setMapping(autoMap)
        setStep(2)
      } catch (err: any) {
        setFileError(`Failed to parse file: ${err?.message || 'Invalid CSV syntax'}`)
      }
    }
    reader.onerror = () => {
      setFileError('Error reading file from disk. Please try again.')
    }
    reader.readAsText(selected)
  }

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setFileError(null)
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
  const handleCommitImport = async () => {
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

    const summary = await bulkAddTrades(payload)
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
      <div className="space-y-5 max-w-6xl mx-auto">
        {/* Page Hero Banner */}
        <PageHeroBanner
          title="Import Center"
          subtitle="Upload your broker statement, or import trading data from CSV files to analyze and track your performance."
          icon={UploadCloud}
          quote="Accurate analytics starts with pristine data."
          middleContent={
            <button
              type="button"
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-white dark:hover:bg-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer hover:shadow-xs"
            >
              <Download className="h-4 w-4 text-emerald-800 dark:text-emerald-400" />
              <span>Download Sample CSV</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
          }
        />

        {/* Step Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3 rounded-full sm:rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c141c] shadow-xs">
          <div
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors',
              step === 1 ? 'bg-[#064e3b] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            )}
          >
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold',
                step === 1 ? 'bg-white/20 text-white' : 'border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              )}
            >
              1
            </span>
            <FileText className="h-3.5 w-3.5" />
            <span>Upload File</span>
          </div>

          <span className="text-slate-300 dark:text-slate-600 font-bold">&gt;</span>

          <div
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors',
              step === 2 ? 'bg-[#064e3b] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            )}
          >
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold',
                step === 2 ? 'bg-white/20 text-white' : 'border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              )}
            >
              2
            </span>
            <MapPin className="h-3.5 w-3.5" />
            <span>Map Columns</span>
          </div>

          <span className="text-slate-300 dark:text-slate-600 font-bold">&gt;</span>

          <div
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors',
              step === 3 ? 'bg-[#064e3b] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            )}
          >
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold',
                step === 3 ? 'bg-white/20 text-white' : 'border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              )}
            >
              3
            </span>
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Validate & Preview</span>
          </div>

          <span className="text-slate-300 dark:text-slate-600 font-bold">&gt;</span>

          <div
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors',
              step === 4 ? 'bg-[#064e3b] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            )}
          >
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold',
                step === 4 ? 'bg-white/20 text-white' : 'border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              )}
            >
              4
            </span>
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Import Summary</span>
          </div>
        </div>

        {/* STEP 1: Upload */}
        {step === 1 && (
          <div className="space-y-5">
            {fileError && (
              <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {/* Main Upload Card */}
            <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c141c] p-6 sm:p-8 shadow-xs space-y-5">
              {/* Target Account Selector */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-[#064e3b] dark:text-emerald-400 fill-[#064e3b] dark:fill-emerald-400" />
                  <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Select Target Trading Account *
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-700 dark:text-slate-400">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-11 pr-10 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
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
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="relative overflow-hidden rounded-3xl border-2 border-dashed border-emerald-300/80 dark:border-emerald-700/60 bg-gradient-to-b from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/20 dark:via-slate-900/40 dark:to-emerald-950/20 p-10 sm:p-14 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-emerald-500 hover:shadow-xs group"
              >
                {/* Soft wave decorations at the bottom */}
                <div className="absolute -bottom-2 -left-2 -right-2 h-16 pointer-events-none opacity-40 dark:opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 600 60" preserveAspectRatio="none">
                    <path d="M0,40 C150,15 350,60 600,30 L600,60 L0,60 Z" fill="#10b981" fillOpacity="0.12" />
                    <path d="M0,50 C200,30 400,65 600,45 L600,60 L0,60 Z" fill="#059669" fillOpacity="0.18" />
                  </svg>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv, .tsv, .txt, .xlsx, .pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Upload Cloud Graphic */}
                <div className="relative mb-3 flex h-20 w-20 items-center justify-center">
                  <svg
                    className="h-16 w-16 text-emerald-500"
                    viewBox="0 0 64 64"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 44A14 14 0 0 1 18 16 18 18 0 0 1 48 20 14 14 0 0 1 48 44H16Z" />
                    <polyline points="26 34 32 28 38 34" strokeWidth="3.5" />
                    <line x1="32" y1="28" x2="32" y2="44" strokeWidth="3.5" />
                  </svg>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                  Click to upload or drag & drop statement
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md font-medium leading-relaxed">
                  Supports MetaTrader 4/5 reports, cTrader statements, TradingView export, and broker CSV files.
                </p>

                {/* File Format Badges */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                  {['CSV', 'TXT', 'XLSX', 'PDF'].map((fmt) => (
                    <span
                      key={fmt}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/70 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/60 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-2xs"
                    >
                      <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Feature Strip */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-emerald-50/70 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 p-4 shadow-xs select-none">
              {/* Ascending Bar Chart Watermark on Right */}
              <svg
                className="absolute right-4 bottom-0 h-14 w-28 pointer-events-none opacity-20 dark:opacity-5 text-emerald-600"
                viewBox="0 0 120 60"
                fill="currentColor"
              >
                <rect x="10" y="35" width="12" height="25" rx="2" />
                <rect x="30" y="25" width="12" height="35" rx="2" />
                <rect x="50" y="15" width="12" height="45" rx="2" />
                <rect x="70" y="5" width="12" height="55" rx="2" />
                <rect x="90" y="0" width="12" height="60" rx="2" />
              </svg>

              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/70 dark:divide-slate-800 gap-3 sm:gap-0">
                <div className="flex items-center gap-3 sm:px-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                    <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Supported Formats</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">CSV, XLSX, TXT, PDF files</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                    <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Secure & Private</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Your data is safe with us</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                    <Zap className="h-4 w-4 stroke-[2.5] fill-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Fast Processing</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Get insights in seconds</p>
                  </div>
                </div>
              </div>
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

