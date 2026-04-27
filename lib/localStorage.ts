import { Game, GameStatus } from "./supabase"

const GAMES_KEY = "videogame_logger_games"
const USER_KEY = "videogame_logger_user"

export type LocalUser = { email: string; id: string }

// DEMO MODE: fixed demo user — remove when re-enabling auth
export const DEMO_USER: LocalUser = { email: "demo@videogame-logger.demo", id: "demo" }

export function getLocalUser(): LocalUser | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setLocalUser(user: LocalUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearLocalUser(): void {
  localStorage.removeItem(USER_KEY)
}

export function getLocalGames(): Game[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(GAMES_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveLocalGames(games: Game[]): void {
  localStorage.setItem(GAMES_KEY, JSON.stringify(games))
}

export function addLocalGame(game: Omit<Game, "id" | "created_at">): Game {
  const games = getLocalGames()
  const newGame: Game = {
    ...game,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }
  saveLocalGames([...games, newGame])
  return newGame
}

export function updateLocalGame(id: string, updates: Partial<Game>): Game | null {
  const games = getLocalGames()
  const idx = games.findIndex((g) => g.id === id)
  if (idx === -1) return null
  games[idx] = { ...games[idx], ...updates }
  saveLocalGames(games)
  return games[idx]
}

export function deleteLocalGame(id: string): void {
  const games = getLocalGames()
  saveLocalGames(games.filter((g) => g.id !== id))
}

export function seedDemoGames(userId: string): void {
  const existing = getLocalGames()
  if (existing.length > 0) return

  const demos: Omit<Game, "id" | "created_at">[] = [
    {
      user_id: userId,
      title: "The Legend of Zelda: Breath of the Wild",
      console: "Nintendo Switch",
      status: "completed",
      days_played: 45,
      start_date: "2023-01-10",
      end_date: "2023-02-24",
      rating: 10,
      notes: "Masterpiece. Explored every corner of Hyrule.",
      cover_url: null,
    },
    {
      user_id: userId,
      title: "God of War Ragnarök",
      console: "PlayStation 5",
      status: "completed",
      days_played: 30,
      start_date: "2023-03-01",
      end_date: "2023-03-31",
      rating: 9,
      notes: "Epic story, incredible graphics.",
      cover_url: null,
    },
    {
      user_id: userId,
      title: "Elden Ring",
      console: "PC",
      status: "playing",
      days_played: 60,
      start_date: "2023-04-15",
      end_date: null,
      rating: null,
      notes: "Still exploring the Lands Between.",
      cover_url: null,
    },
    {
      user_id: userId,
      title: "Hollow Knight",
      console: "Nintendo Switch",
      status: "dropped",
      days_played: 10,
      start_date: "2022-12-01",
      end_date: "2022-12-11",
      rating: 7,
      notes: "Great game but got too busy.",
      cover_url: null,
    },
    {
      user_id: userId,
      title: "Cyberpunk 2077",
      console: "PC",
      status: "backlog",
      days_played: null,
      start_date: null,
      end_date: null,
      rating: null,
      notes: "Heard the post-patch version is amazing.",
      cover_url: null,
    },
  ]

  demos.forEach((g) => addLocalGame(g))
}
