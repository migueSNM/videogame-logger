"use client"

import { useState, useEffect } from "react"
import LoginPage from "@/components/LoginPage"
import Dashboard from "@/components/Dashboard"
import { getLocalUser, LocalUser } from "@/lib/localStorage"

export default function Home() {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setUser(getLocalUser())
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (!user) {
    return <LoginPage onLogin={(id) => setUser(getLocalUser())} />
  }

  return (
    <Dashboard
      userId={user.id}
      userEmail={user.email}
      onLogout={() => setUser(null)}
    />
  )
}
