'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: LucideIcon
  sentiment?: 'positive' | 'negative' | 'neutral' | 'warning'
  trend?: string
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  sentiment = 'neutral',
  trend,
}: MetricCardProps) {
  const sentimentStyles = {
    positive: 'text-emerald-600 dark:text-emerald-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-foreground',
    warning: 'text-amber-600 dark:text-amber-400',
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          {Icon && (
            <div className="rounded-md bg-secondary/80 p-1.5 text-muted-foreground">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={cn('text-2xl font-bold font-mono tracking-tight tabular-nums', sentimentStyles[sentiment])}>
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                'text-xs font-semibold px-1.5 py-0.5 rounded',
                sentiment === 'positive' && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
                sentiment === 'negative' && 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
                sentiment === 'neutral' && 'bg-secondary text-secondary-foreground'
              )}
            >
              {trend}
            </span>
          )}
        </div>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}
