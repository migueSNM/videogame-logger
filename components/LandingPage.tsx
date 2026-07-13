"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Gamepad2, Loader2, Sparkles, Mail } from "lucide-react"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"

interface LandingPageProps {
  onTryFree: () => void
}

export default function LandingPage({ onTryFree }: LandingPageProps) {
  const [step, setStep] = useState<"landing" | "signin">("landing")
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [checkEmail, setCheckEmail] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (!isSupabaseConfigured()) {
      setError("Sign-in isn't configured yet. Try the free trial instead.")
      return
    }
    setLoading(true)
    setError("")

    const supabase = createClient()
    const trimmedEmail = email.toLowerCase().trim()

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
      })
      setLoading(false)
      if (signUpError) {
        setError(signUpError.message)
        return
      }
      if (!data.session) {
        // Email confirmation is required — Supabase created the user but
        // won't issue a session until they click the link in their inbox.
        setCheckEmail(true)
        return
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      })
      setLoading(false)
      if (signInError) {
        setError(signInError.message)
        return
      }
    }
  }

  async function handleGoogleSignIn() {
    if (!isSupabaseConfigured()) {
      setError("Sign-in isn't configured yet. Try the free trial instead.")
      return
    }
    setGoogleLoading(true)
    setError("")
    const supabase = createClient()
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (oauthError) {
      setError(oauthError.message)
      setGoogleLoading(false)
    }
    // On success the browser navigates away to Google — no further code runs here.
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

        {step === "landing" ? (
          <Card className="border-border/50 shadow-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Get started</CardTitle>
              <CardDescription>Jump in with a free trial, or sign in to save your library</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={onTryFree} className="w-full h-10 gap-2">
                <Sparkles className="h-4 w-4" />
                Try it for free
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep("signin")}
                className="w-full h-10"
              >
                Sign in
              </Button>
            </CardContent>
          </Card>
        ) : checkEmail ? (
          <Card className="border-border/50 shadow-2xl">
            <CardHeader className="space-y-1 items-center text-center">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 mb-1">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Check your email</CardTitle>
              <CardDescription>
                We sent a confirmation link to {email.toLowerCase().trim()}. Click it to activate your account and sign in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                onClick={() => { setCheckEmail(false); setMode("signin"); setPassword(""); setError("") }}
                className="w-full h-9 text-sm text-muted-foreground"
              >
                ← Back to sign in
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50 shadow-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">{mode === "signup" ? "Create an account" : "Sign in"}</CardTitle>
              <CardDescription>
                {mode === "signup" ? "Sign up to save your game library" : "Enter your email to access your game library"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full h-10 gap-2"
              >
                {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError("") }}
                    disabled={loading || googleLoading}
                    autoFocus
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError("") }}
                    disabled={loading || googleLoading}
                    className="h-10"
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <Button type="submit" className="w-full h-10" disabled={loading || googleLoading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === "signup" ? "Creating account…" : "Signing in…"}
                    </>
                  ) : mode === "signup" ? "Create account" : "Continue with Email"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setMode(mode === "signup" ? "signin" : "signup")
                    setError("")
                  }}
                  className="w-full h-9 text-sm text-muted-foreground"
                  disabled={loading || googleLoading}
                >
                  {mode === "signup" ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setStep("landing"); setError("") }}
                  className="w-full h-9 text-sm text-muted-foreground"
                  disabled={loading || googleLoading}
                >
                  ← Back
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground">
          Trial accounts are limited to 10 games and stored only in this browser.
          <br />
          Signed-in accounts are saved to your account and unlimited.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
