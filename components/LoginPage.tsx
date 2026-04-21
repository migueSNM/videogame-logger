"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gamepad2, Loader2 } from "lucide-react"
import { setLocalUser, seedDemoGames } from "@/lib/localStorage"

interface LoginPageProps {
  onLogin: (userId: string) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }
    setLoading(true)
    setError("")

    // Simulate a brief loading state for UX polish
    setTimeout(() => {
      const userId = btoa(email.toLowerCase().trim()).replace(/[^a-z0-9]/gi, "").slice(0, 20)
      setLocalUser({ email: email.toLowerCase().trim(), id: userId })
      seedDemoGames(userId)
      onLogin(userId)
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <Gamepad2 className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Videogame Logger</h1>
          <p className="text-muted-foreground text-lg">
            Track every game you play. Relive your adventures.
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>Enter your email to access your game library</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError("") }}
                  disabled={loading}
                  autoFocus
                  className="h-10"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <Button type="submit" className="w-full h-10" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Continue with Email"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo note */}
        <p className="text-center text-xs text-muted-foreground">
          Demo mode — your data is saved locally in the browser.
          <br />
          5 sample games will be pre-loaded on first sign-in.
        </p>
      </div>
    </div>
  )
}
