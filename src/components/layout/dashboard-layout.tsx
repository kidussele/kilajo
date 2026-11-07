'use client'

import React, { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { X } from 'lucide-react'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#f4f7f6] text-slate-800">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block shrink-0">
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
