'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { X, Bot } from 'lucide-react'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="relative flex min-h-screen bg-[#F6F8FC] dark:bg-[#090E17] text-[#172033] dark:text-slate-100 overflow-hidden transition-colors duration-200">
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
          <div className="relative z-50 flex flex-col w-72 bg-white dark:bg-[#0D1424] shadow-2xl">
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
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:px-8 max-w-[1600px] w-full mx-auto space-y-5">
          {children}
        </main>
      </div>

      {/* Floating AI Assistant Quick Trigger */}
      <Link
        href="/ai-coach"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-[#3157D5]/20 dark:border-blue-700/60 bg-[#3157D5] text-white px-4 py-2.5 shadow-lg shadow-blue-900/20 hover:bg-[#2745AE] hover:shadow-xl hover:scale-105 transition-all group cursor-pointer"
        title="Open AI Assistant & Teacher Helper"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <Bot className="h-4 w-4 text-blue-100 group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold tracking-tight">AI Assistant</span>
      </Link>
    </div>
  )
}
