import type { Metadata } from 'next'
import './globals.css'
import { TradingProvider } from '@/context/trading-context'
import { ThemeProvider } from '@/context/theme-context'

export const metadata: Metadata = {
  title: 'KILAJO — Universal Trading Journal & Analytics',
  description: 'Multi-account, broker-independent trading journal, prop firm challenge tracker, and institutional performance analytics.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('kilajo-theme');
                if (saved === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
        <ThemeProvider>
          <TradingProvider>{children}</TradingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

