'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { X, Bot } from 'lucide-react'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="relative flex min-h-screen bg-[#f8faf9] dark:bg-[#070d14] text-slate-800 dark:text-slate-100 overflow-hidden transition-colors duration-200">
      {/* Background Organic Mint Wave Flourishes Matching Reference Images */}
      <div className="fixed -bottom-10 -left-10 w-96 h-96 pointer-events-none opacity-40 dark:opacity-10 z-0">
        <svg viewBox="0 0 400 400" className="w-full h-full fill-emerald-200/50 dark:fill-emerald-800/40">
          <path d="M0,250 C120,200 180,350 350,280 C400,260 420,380 400,400 L0,400 Z" />
        </svg>
      </div>
      <div className="fixed -bottom-16 -right-16 w-[500px] h-[400px] pointer-events-none opacity-45 dark:opacity-10 z-0">
        <svg viewBox="0 0 500 400" className="w-full h-full fill-emerald-100/60 dark:fill-emerald-800/30">
          <path d="M50,400 C150,280 250,380 400,260 C460,220 480,320 500,400 Z" />
        </svg>
      </div>

      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block shrink-0 relative z-20">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 flex flex-col w-72 bg-white dark:bg-[#0c141c] shadow-2xl">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-3 top-4 z-50 rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar isMobile onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto space-y-5">
          {children}
        </main>
      </div>

      {/* Floating AI Assistant Quick Trigger */}
      <Link
        href="/ai-coach"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-emerald-300 dark:border-emerald-700 bg-[#064e3b] text-white px-4 py-2.5 shadow-lg shadow-emerald-950/25 hover:bg-[#043c2e] hover:scale-105 transition-all group cursor-pointer"
        title="Open AI Assistant & Teacher Helper"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <Bot className="h-4 w-4 text-emerald-300 group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold tracking-tight">AI Assistant</span>
      </Link>
    </div>
  )
}
