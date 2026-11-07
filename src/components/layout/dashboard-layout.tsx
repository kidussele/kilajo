'use client'

import React, { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { X } from 'lucide-react'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="relative flex min-h-screen bg-[#f8faf9] text-slate-800 overflow-hidden">
      {/* Background Organic Mint Wave Flourishes Matching Reference Images */}
      <div className="fixed -bottom-10 -left-10 w-96 h-96 pointer-events-none opacity-40 z-0">
        <svg viewBox="0 0 400 400" className="w-full h-full fill-emerald-200/50">
          <path d="M0,250 C120,200 180,350 350,280 C400,260 420,380 400,400 L0,400 Z" />
        </svg>
      </div>
      <div className="fixed -bottom-16 -right-16 w-[500px] h-[400px] pointer-events-none opacity-45 z-0">
        <svg viewBox="0 0 500 400" className="w-full h-full fill-emerald-100/60">
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 flex flex-col w-72 bg-white shadow-2xl">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-3 top-4 z-50 rounded-xl p-1.5 text-slate-500 hover:bg-slate-100"
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
    </div>
  )
}
