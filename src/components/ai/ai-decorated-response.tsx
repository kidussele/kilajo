'use client'

import React, { useState, useMemo } from 'react'
import {
  Bot,
  Copy,
  Check,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ShieldAlert,
  Brain,
  Award,
  ChevronRight,
  TrendingUp,
  Flame,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AiDecoratedResponseProps {
  content: string
  title?: string
  variant?: 'chat' | 'card' | 'compact'
  timestamp?: string
  className?: string
  onAskFollowup?: (question: string) => void
}

export function AiDecoratedResponse({
  content,
  title,
  variant = 'card',
  timestamp,
  className,
  onAskFollowup,
}: AiDecoratedResponseProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!content) return
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Parse lines into structured formatted blocks
  const formattedBlocks = useMemo(() => {
    if (!content) return []

    // Split content by paragraphs or headers
    const rawParagraphs = content.split(/\n\s*\n/)
    
    return rawParagraphs.map((para, index) => {
      const trimmed = para.trim()
      if (!trimmed) return null

      // Check if it's an Executive Summary or Score block
      const isScore = /execution score|rating|score:\s*\d+/i.test(trimmed)
      const isMistake = /critical mistake|mistakes found|rule violation|risk breach|flaw costing|blindspot|⚠️|🚨|❌/i.test(trimmed)
      const isTeacher = /teacher|homework|actionable rule|lesson|recommendation|solution|prescript|💡|👨‍🏫|✅/i.test(trimmed)
      const isPsychology = /psychology|emotion|fear|greed|tilt|revenge|discipline|🧠/i.test(trimmed)
      const isHeading = /^#+\s|^\d+\.\s+\*\*|^[🩺⚠️🧠👨‍🏫🎯💡🚨]\s+\*\*/.test(trimmed)

      return {
        id: index,
        text: trimmed,
        isScore,
        isMistake,
        isTeacher,
        isPsychology,
        isHeading,
      }
    }).filter(Boolean)
  }, [content])

  // Helper to render bold text, symbols, currencies and percentages inside paragraphs
  const renderFormattedText = (text: string) => {
    // Break into lines if multiple
    const lines = text.split('\n')
    
    return lines.map((line, lIdx) => {
      const lineTrimmed = line.trim()
      if (!lineTrimmed) return <div key={lIdx} className="h-2" />

      // List item detection (e.g. - item or * item)
      const isBullet = /^[-*•]\s+/.test(lineTrimmed)
      // Numbered item detection (e.g. 1. item)
      const numberMatch = lineTrimmed.match(/^(\d+)\.\s+(.*)/)

      let cleanLine = lineTrimmed
      let bulletPrefix: React.ReactNode = null

      if (isBullet) {
        cleanLine = lineTrimmed.replace(/^[-*•]\s+/, '')
        bulletPrefix = (
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5 mr-2" />
        )
      } else if (numberMatch) {
        cleanLine = numberMatch[2]
        bulletPrefix = (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-mono text-[10px] font-bold mr-2 shadow-2xs">
            {numberMatch[1]}
          </span>
        )
      }

      // Format bold segments (**text**) and code (`text`)
      const parts = cleanLine.split(/(\*\*.*?\*\*|`.*?`)/g)

      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2)
          return (
            <strong
              key={pIdx}
              className="font-bold text-slate-900 dark:text-white"
            >
              {boldText}
            </strong>
          )
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          const codeText = part.slice(1, -1)
          return (
            <code
              key={pIdx}
              className="px-1.5 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
            >
              {codeText}
            </code>
          )
        }

        // Highlight financial tokens ($1,000, 2.5R, 85%)
        const subTokens = part.split(/(\$\d+(?:,\d+)*(?:\.\d+)?|\b\d+(?:\.\d+)?%|\b[+-]?\d+(?:\.\d+)?R\b)/g)
        return subTokens.map((sub, sIdx) => {
          if (/^\$\d+(?:,\d+)*(?:\.\d+)?$/.test(sub) || /^\d+(?:\.\d+)?%$/.test(sub) || /^[+-]?\d+(?:\.\d+)?R$/.test(sub)) {
            return (
              <span
                key={`${pIdx}-${sIdx}`}
                className="font-mono font-bold text-emerald-700 dark:text-emerald-300 tabular-nums px-0.5"
              >
                {sub}
              </span>
            )
          }
          return sub
        })
      })

      return (
        <div key={lIdx} className={cn('flex items-start my-1', isBullet || numberMatch ? 'pl-1' : '')}>
          {bulletPrefix}
          <div className="flex-1 leading-relaxed text-xs sm:text-[13px] text-slate-700 dark:text-slate-200">
            {formattedParts}
          </div>
        </div>
      )
    })
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        variant === 'card' &&
          'rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-[#0c141c]/95 backdrop-blur-xl shadow-xs',
        variant === 'chat' &&
          'rounded-3xl border border-emerald-500/20 dark:border-emerald-800/40 bg-gradient-to-b from-emerald-50/40 via-white to-white dark:from-[#06241b]/40 dark:via-[#0c141c] dark:to-[#0c141c] shadow-xs',
        className
      )}
    >
      {/* Decorative Top Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />

      {/* Header Bar */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#064e3b] to-emerald-600 text-white shadow-xs">
            <Bot className="h-4 w-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {title || 'Institutional AI Mentor Feedback'}
              </h4>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[9px] font-bold border border-emerald-200/60 dark:border-emerald-800/60">
                <Sparkles className="h-2.5 w-2.5" />
                Gemini 3.8 Flash
              </span>
            </div>
            {timestamp && (
              <p className="text-[10px] text-slate-400">Generated {timestamp}</p>
            )}
          </div>
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-emerald-500 shadow-2xs transition-all cursor-pointer"
          title="Copy feedback"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-600 stroke-[2.5]" />
              <span className="text-emerald-600 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Structured Content Stream */}
      <div className="p-4 sm:p-5 space-y-3.5">
        {formattedBlocks.map((block) => {
          if (!block) return null

          // 1. Critical Mistake Callout Box
          if (block.isMistake && !block.isTeacher) {
            return (
              <div
                key={block.id}
                className="rounded-2xl border border-rose-200/90 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-4 shadow-2xs space-y-1 relative overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="h-3.5 w-3.5 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    Critical Mistake & Risk Leak Detected
                  </span>
                </div>
                {renderFormattedText(block.text)}
              </div>
            )
          }

          // 2. Actionable Teacher / Homework Solution Box
          if (block.isTeacher) {
            return (
              <div
                key={block.id}
                className="rounded-2xl border border-emerald-200/90 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 shadow-2xs space-y-1 relative overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Teacher Action Plan & Prescription
                  </span>
                </div>
                {renderFormattedText(block.text)}
              </div>
            )
          }

          // 3. Psychology & Tilt Warning Box
          if (block.isPsychology) {
            return (
              <div
                key={block.id}
                className="rounded-2xl border border-purple-200/90 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 p-4 shadow-2xs space-y-1"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                    <Brain className="h-3.5 w-3.5 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                    Behavioral & Mindset Diagnosis
                  </span>
                </div>
                {renderFormattedText(block.text)}
              </div>
            )
          }

          // 4. Default Clean Formatted Paragraph
          return (
            <div
              key={block.id}
              className={cn(
                'rounded-2xl p-3.5',
                block.isHeading
                  ? 'bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800'
                  : 'bg-transparent'
              )}
            >
              {renderFormattedText(block.text)}
            </div>
          )
        })}
      </div>

      {/* Bottom Footer Quick Actions */}
      <div className="px-4 py-3 sm:px-5 sm:py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <Award className="h-3.5 w-3.5 text-emerald-600" />
          <span>Institutional Rule: <strong>Never trade without an invalidation level.</strong></span>
        </div>

        {onAskFollowup && (
          <button
            type="button"
            onClick={() => onAskFollowup('How can I fix these mistakes in my next trading session?')}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 transition-colors cursor-pointer"
          >
            <span>Ask Follow-up</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}

