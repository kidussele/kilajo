'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PageHeroBanner } from '@/components/ui/page-hero-banner'
import { MetricCard } from '@/components/dashboard/metric-card'
import {
  Sparkles,
  Check,
  Zap,
  Shield,
  Award,
  Crown,
  Lock,
  ArrowRight,
  TrendingUp,
  Database,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  Star,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PlansPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual')
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'institutional'>('pro')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const plans = [
    {
      id: 'starter',
      name: 'Starter Plan',
      tagline: 'Ideal for manual journaling and beginner discipline building',
      priceMonthly: 0,
      priceAnnual: 0,
      badge: 'Free Forever',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      popular: false,
      features: [
        '1 Connected Trading Account',
        'Manual CSV Statement Uploads',
        'Daily Realized P&L & Balance Curve',
        'Trading Calendar with Win/Loss Days',
        'Discipline & Psychology Reflection Logs',
        '30-Day Historical Data Retention',
        'Standard Community Support',
      ],
      notIncluded: [
        'Automated MT4/MT5 Webhook Bridge',
        'Prop Firm Challenge Rule Engine',
        'Unlimited Strategy Playbooks',
        'Multi-Currency Balance Reconciliation',
      ],
      cta: 'Current Plan',
      ctaActive: false,
    },
    {
      id: 'pro',
      name: 'Pro Trader',
      tagline: 'Full power for active traders, prop-firm challenges, and systematic edges',
      priceMonthly: 29,
      priceAnnual: 24,
      badge: 'MOST POPULAR',
      badgeColor: 'bg-[#064e3b] text-white border-emerald-600',
      popular: true,
      features: [
        'Unlimited Trading Accounts (Brokers & Prop Firms)',
        'Real-time MT4 & MT5 Webhook Bridge Sync',
        'Universal Prop Firm Challenge Tracker & Guards',
        'Full Strategy Playbook Audit Engine',
        'Deep Statistical Analytics & Session Breakdowns',
        'Multi-Currency P&L Reconciliation (USD, EUR, GBP, JPY)',
        'Export Institutional PDF Statements & CSVs',
        'Lifetime Historical Trade Data Retention',
        'Priority Technical & Integration Support',
      ],
      notIncluded: [
        'Dedicated Private Webhook Relay IP',
      ],
      cta: 'Upgrade to Pro Trader',
      ctaActive: true,
    },
    {
      id: 'institutional',
      name: 'Institutional Fund',
      tagline: 'Engineered for prop firms, money managers, and multi-trader syndicates',
      priceMonthly: 79,
      priceAnnual: 64,
      badge: 'Enterprise Edge',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      popular: false,
      features: [
        'Everything in Pro Trader included',
        'Multi-User Team Management & Sub-Accounts',
        'Combined Portfolio Drawdown Kill-Switch Alerts',
        'Dedicated High-Frequency Webhook Relay IP',
        'Custom Broker API Ingestion & Statement Parser',
        'Tax-Ready Audited P&L Reporting & Logs',
        '1-on-1 Dedicated Systems Architect Onboarding',
        '24/7 SLA Priority Phone & Telegram Support',
      ],
      notIncluded: [],
      cta: 'Contact Institutional Sales',
      ctaActive: true,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto select-none">
        {/* 1. Page Hero Banner */}
        <PageHeroBanner
          title="Subscription & Membership Plans"
          subtitle="Choose the optimal tier for automated MT4/MT5 syncing, prop-firm analytics, and institutional execution edge."
          icon={Crown}
          quote="Invest in your trading infrastructure; compound your edge."
          middleContent={
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/95 border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-semibold transition-all',
                  billingCycle === 'monthly'
                    ? 'bg-[#064e3b] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all',
                  billingCycle === 'annual'
                    ? 'bg-[#064e3b] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <span>Annual Billing</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  SAVE 20%
                </span>
              </button>
            </div>
          }
        />

        {/* 2. Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            title="Current Membership"
            value="Pro Trader"
            subtitle="Active evaluation trial"
            icon={Crown}
            color="emerald"
            infoTooltip
          />
          <MetricCard
            title="Billing Cadence"
            value={billingCycle === 'annual' ? 'Annual (Save 20%)' : 'Monthly'}
            subtitle="Next renewal: Nov 2027"
            icon={RefreshCw}
            color="blue"
            infoTooltip
          />
          <MetricCard
            title="Connected Accounts"
            value="Unlimited"
            subtitle="Broker & Prop Firm slots"
            icon={Database}
            color="purple"
            infoTooltip
          />
          <MetricCard
            title="MT5 Bridge Status"
            value="Active Sync"
            subtitle="Secure SHA-256 webhook"
            icon={Zap}
            color="amber"
            infoTooltip
          />
        </div>

        {/* 3. Pricing Tier Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly
            const isSelected = selectedPlan === plan.id

            return (
              <div
                key={plan.id}
                className={cn(
                  'relative flex flex-col justify-between rounded-3xl border bg-white p-7 transition-all shadow-xs',
                  plan.popular
                    ? 'border-2 border-emerald-500 shadow-lg shadow-emerald-900/10 ring-4 ring-emerald-500/10'
                    : 'border-slate-200/90 hover:border-slate-300'
                )}
              >
                {/* Popular Pill Badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#064e3b] text-white px-4 py-1 text-[11px] font-bold uppercase tracking-wider shadow-md">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  {/* Tier Title & Tagline */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold font-sans text-slate-900">{plan.name}</h3>
                    {!plan.popular && (
                      <span className={cn('text-[10px] font-bold px-2.5 py-0.5 rounded-full border', plan.badgeColor)}>
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 min-h-[34px] leading-relaxed font-medium">
                    {plan.tagline}
                  </p>

                  {/* Price Block */}
                  <div className="my-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold font-mono text-slate-900 tracking-tight">
                        ${price}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        / month {billingCycle === 'annual' && price > 0 ? '(billed annually)' : ''}
                      </span>
                    </div>
                    {billingCycle === 'annual' && price > 0 && (
                      <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                        Billed as ${price * 12}/year (save ${(plan.priceMonthly - plan.priceAnnual) * 12})
                      </p>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 mb-6">
                    <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                      Included with {plan.name}:
                    </p>
                    <ul className="space-y-2.5 text-xs text-slate-700">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mt-0.5">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                          <span className="leading-tight font-medium text-slate-800">{feat}</span>
                        </li>
                      ))}
                      {plan.notIncluded.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 opacity-40">
                          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 mt-0.5">
                            <span className="text-[10px] font-bold">✕</span>
                          </div>
                          <span className="leading-tight line-through font-medium text-slate-500">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlan(plan.id as any)
                      setShowUpgradeModal(true)
                    }}
                    className={cn(
                      'w-full py-3 px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs',
                      plan.popular
                        ? 'bg-[#064e3b] hover:bg-[#043c2e] text-white shadow-emerald-950/20 hover:scale-[1.02]'
                        : plan.id === 'starter'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'border border-slate-300 hover:border-slate-400 bg-white text-slate-800'
                    )}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* 4. Bottom Feature Trust Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-emerald-50/70 p-4 shadow-xs select-none">
          {/* Watermark bar chart on right */}
          <svg
            className="absolute right-4 bottom-0 h-14 w-28 pointer-events-none opacity-20 text-emerald-600"
            viewBox="0 0 120 60"
            fill="currentColor"
          >
            <rect x="10" y="35" width="12" height="25" rx="2" />
            <rect x="30" y="25" width="12" height="35" rx="2" />
            <rect x="50" y="15" width="12" height="45" rx="2" />
            <rect x="70" y="5" width="12" height="55" rx="2" />
            <rect x="90" y="0" width="12" height="60" rx="2" />
          </svg>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/70 gap-3 sm:gap-0">
            <div className="flex items-center gap-3 sm:px-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Zero Lock-In</p>
                <p className="text-[11px] text-slate-500 font-medium">Switch or cancel anytime in 1-click</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                <Lock className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Encrypted & Safe</p>
                <p className="text-[11px] text-slate-500 font-medium">Read-only API & HMAC SHA-256</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                <TrendingUp className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Universal Sync</p>
                <p className="text-[11px] text-slate-500 font-medium">MetaTrader, cTrader & CSV</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                <Award className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">14-Day Guarantee</p>
                <p className="text-[11px] text-slate-500 font-medium">Full refund if not satisfied</p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Upgrade Dialog / Toast Notification */}
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="relative w-full max-w-md rounded-3xl border border-slate-100 bg-white p-7 shadow-2xl text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Crown className="h-7 w-7" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedPlan === 'pro'
                    ? 'Pro Trader Subscription'
                    : selectedPlan === 'institutional'
                    ? 'Institutional Fund Tier'
                    : 'Starter Free Plan'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Your account is currently running in full Pro trial evaluation mode with unlimited accounts and automated MT5 bridge sync.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-xs text-left space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>Selected Tier:</span>
                  <span className="font-mono text-emerald-800 font-bold uppercase">{selectedPlan}</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>Billing Interval:</span>
                  <span className="font-mono text-emerald-800 font-bold capitalize">{billingCycle}</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-slate-800 border-t border-emerald-200/60 pt-2">
                  <span>Total Due Today:</span>
                  <span className="font-mono text-base font-bold text-[#064e3b]">
                    ${selectedPlan === 'starter' ? 0 : billingCycle === 'annual' ? (selectedPlan === 'pro' ? 24 * 12 : 64 * 12) : (selectedPlan === 'pro' ? 29 : 79)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#043c2e] text-white text-xs font-bold shadow-xs"
                >
                  Confirm Subscription
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
