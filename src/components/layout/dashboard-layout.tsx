'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { X, Bot } from 'lucide-react'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#cbe5ff] via-[#dff0fe] to-[#b7ddfd] dark:from-[#071324] dark:via-[#0c1a2e] dark:to-[#0f243e] p-2 sm:p-4 lg:p-6 flex flex-col items-center justify-center transition-colors duration-300">
      {/* Outer Glow & Ambient Light Orbs */}
      <div className="fixed -top-24 -left-24 h-96 w-96 rounded-full bg-blue-300/30 dark:bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-300/30 dark:bg-cyan-600/10 blur-3xl pointer-events-none" />

      {/* Main Curved Dashboard Shell Container (Matching Reference UI) */}
      <div className="relative w-full max-w-[1720px] bg-white dark:bg-[#0c141c] rounded-[28px] sm:rounded-[36px] shadow-[0_20px_60px_-15px_rgba(30,58,138,0.18)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border border-white/90 dark:border-slate-800/80 flex overflow-hidden min-h-[92vh] z-10">
        {/* Desktop Slim Icon Dock Sidebar */}
        <div className="hidden md:flex shrink-0 border-r border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0c141c] z-20">
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
                className="absolute right-3 top-4 z-50 rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              <Sidebar isMobile onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0 bg-[#fafcff] dark:bg-[#090f17]">
          <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:px-8 space-y-6">
            {children}
          </main>
        </div>
      </div>

      {/* Floating AI Assistant Quick Trigger */}
      <Link
        href="/ai-coach"
        className="fixed bottom-6 right-8 z-40 flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-700 bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-4 py-2.5 shadow-xl shadow-blue-900/30 hover:scale-105 transition-all group cursor-pointer"
        title="Open AI Assistant & Mentor"
      >
        <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
        <Bot className="h-4 w-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold tracking-tight">AI Mentor</span>
      </Link>
    </div>
  )
}
