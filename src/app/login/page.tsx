'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { TrendingUp, AlertCircle, Lock, Mail, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
      } else if (data.session) {
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate. Please check your credentials.')
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
            Universal Trading Terminal & Analytics
          </p>
        </div>

        <Card className="shadow-lg border-border/80">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-bold">Sign In to Your Account</CardTitle>
            <p className="text-xs text-muted-foreground">
              Access your real multi-broker trading journals and prop challenges.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="trader@kilajo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 text-xs mt-2"
              >
                {isLoading ? 'Verifying...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 border-t pt-4 text-center text-xs text-muted-foreground">
            <div>
              Don't have a verified account?{' '}
              <Link href="/signup" className="text-primary font-semibold hover:underline">
                Register here
              </Link>
            </div>
            <Link href="/" className="text-[11px] hover:underline text-muted-foreground">
              Continue exploring terminal in demo mode →
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
