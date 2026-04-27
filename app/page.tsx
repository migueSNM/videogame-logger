"use client"

import { useState, useEffect } from "react"
// DEMO MODE: LoginPage kept for when auth is re-enabled
// import LoginPage from "@/components/LoginPage"
import Dashboard from "@/components/Dashboard"
import { getLocalUser, setLocalUser, LocalUser, DEMO_USER } from "@/lib/localStorage"

export default function Home() {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // DEMO MODE: auto-init demo user, skip login
    let u = getLocalUser()
    if (!u) {
      setLocalUser(DEMO_USER)
      u = DEMO_USER
    }
    setUser(u)
    setMounted(true)
  }, [])

  if (!mounted) return null

  // DEMO MODE: login gate disabled — re-enable when auth is restored
  // if (!user) {
  //   return <LoginPage onLogin={() => setUser(getLocalUser())} />
  // }

  return (
    <Dashboard
      userId={user!.id}
      userEmail={user!.email}
      onLogout={() => {
        // DEMO MODE: re-init demo user instead of going to login screen
        setLocalUser(DEMO_USER)
        setUser(DEMO_USER)
      }}
    />
  )
}
