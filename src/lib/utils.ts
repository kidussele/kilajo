import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'USD',
  showSign: boolean = false
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00'
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const formatted = formatter.format(Math.abs(amount))
  if (amount < 0) {
    return `-${formatted}`
  } else if (showSign && amount > 0) {
    return `+${formatted}`
  }
  return formatted
}

export function formatPercent(value: number | null | undefined, showSign: boolean = false): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%'
  }

  const formatted = `${Math.abs(value).toFixed(2)}%`
  if (value < 0) {
    return `-${formatted}`
  } else if (showSign && value > 0) {
    return `+${formatted}`
  }
  return formatted
}

export function formatNumber(
  value: number | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00'
  }
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  try {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  try {
    const d = new Date(dateString)
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

