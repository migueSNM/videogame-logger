"use client"

import { useState, useEffect, useSyncExternalStore } from "react"
import type { User } from "@supabase/supabase-js"
import LandingPage from "@/components/LandingPage"
import Dashboard from "@/components/Dashboard"
import { getLocalUser, setLocalUser, clearLocalUser, subscribeLocalUser, TRIAL_USER } from "@/lib/localStorage"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"

function getServerLocalUser() {
  return null
}

function useTrialUser() {
  return useSyncExternalStore(subscribeLocalUser, getLocalUser, getServerLocalUser)
}

export default function Home() {
  const trialUser = useTrialUser()
  // Supabase config is a static env check, not reactive state — if it's
  // missing there's nothing to fetch, so skip straight past the loading state.
  const [supabaseUser, setSupabaseUser] = useState<User | null | undefined>(
    () => (isSupabaseConfigured() ? undefined : null)
  )

  useEffect(() => {
    if (trialUser || !isSupabaseConfigured()) return

    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setSupabaseUser(data.user ?? null)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, authSession) => {
      setSupabaseUser(authSession?.user ?? null)
    })

    return () => sub.subscription.unsubscribe()
  }, [trialUser])

  if (trialUser) {
    return (
      <Dashboard
        userId={trialUser.id}
        userEmail={trialUser.email}
        isTrial
        source="local"
        onLogout={clearLocalUser}
      />
    )
  }

  if (supabaseUser === undefined) return null

  if (!supabaseUser) {
    return (
      <LandingPage
        onTryFree={() => setLocalUser(TRIAL_USER)}
      />
    )
  }

  return (
    <Dashboard
      userId={supabaseUser.id}
      userEmail={supabaseUser.email ?? ""}
      isTrial={false}
      source="supabase"
      onLogout={async () => {
        await createClient().auth.signOut()
        setSupabaseUser(null)
      }}
    />
  )
}
