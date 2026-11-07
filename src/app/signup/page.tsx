'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { TrendingUp, AlertCircle, Lock, Mail, User, CheckCircle2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [baseCurrency, setBaseCurrency] = useState('USD')
  const [timezone, setTimezone] = useState('UTC')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            base_currency: baseCurrency,
            timezone,
          },
        },
      })

      if (authError) {
        setError(authError.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 1500)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create account.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm mb-2">
            <TrendingUp className="h-6 w-6 text-emerald-400 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
            KILAJO
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-sans font-medium">
            Institutional Multi-Broker Platform
          </p>
        </div>

        <Card className="shadow-lg border-border/80">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-bold">Create Trader Account</CardTitle>
            <p className="text-xs text-muted-foreground">
              Initialize your secure, isolated PostgreSQL trading database.
            </p>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="p-6 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Account Created Successfully</h3>
                <p className="text-xs text-muted-foreground">Redirecting to your personal trading journal...</p>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-3.5 text-xs">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="Alex Mercer"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      placeholder="alex@tradingfirm.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Password (min 6 characters)</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Base Currency</label>
                    <select
                      value={baseCurrency}
                      onChange={(e) => setBaseCurrency(e.target.value)}
                      className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="AUD">AUD (A$)</option>
                      <option value="CAD">CAD (C$)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs"
                    >
                      <option value="UTC">UTC (Default)</option>
                      <option value="America/New_York">EST (New York)</option>
                      <option value="Europe/London">GMT (London)</option>
                      <option value="Asia/Tokyo">JST (Tokyo)</option>
                      <option value="Asia/Dubai">GST (Dubai)</option>
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 text-xs mt-3"
                >
                  {isLoading ? 'Creating Account...' : 'Complete Registration'}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4 text-xs text-muted-foreground">
            <div>
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
