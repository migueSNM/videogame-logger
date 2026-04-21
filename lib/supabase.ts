import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      games: {
        Row: Game
        Insert: Omit<Game, "id" | "created_at">
        Update: Partial<Omit<Game, "id" | "created_at">>
      }
    }
  }
}

export type GameStatus = "playing" | "completed" | "dropped" | "backlog" | "wishlist"

export type Game = {
  id: string
  user_id: string
  title: string
  console: string
  status: GameStatus
  days_played: number | null
  start_date: string | null
  end_date: string | null
  rating: number | null
  notes: string | null
  cover_url: string | null
  created_at: string
}
