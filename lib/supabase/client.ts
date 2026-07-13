import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./types"

// Supabase's client factories throw synchronously if the URL/key are
// missing, and trial mode is meant to work with zero Supabase setup — check
// this before calling createClient() anywhere real sign-in isn't guaranteed.
export function isSupabaseConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
