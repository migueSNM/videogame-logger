export type Database = {
  public: {
    Tables: {
      games: {
        Row: Game
        Insert: Omit<Game, "id" | "created_at">
        Update: Partial<Omit<Game, "id" | "created_at">>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
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
