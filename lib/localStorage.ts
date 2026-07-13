import { Game } from "./supabase/types"
import { SEED_GAMES } from "./seedGames"

const GAMES_KEY = "videogame_logger_games"
const USER_KEY = "videogame_logger_user"

export type LocalUser = { email: string; id: string; isTrial?: boolean }

export const TRIAL_GAME_LIMIT = 10

export const TRIAL_USER: LocalUser = { email: "trial@videogame-logger.demo", id: "trial", isTrial: true }

const LOCAL_USER_EVENT = "videogame-logger:local-user-change"

// Cache keyed on the raw string so repeated calls with unchanged storage
// return the same object reference — required for useSyncExternalStore,
// which treats a new reference on every call as a changed snapshot and
// re-renders in a loop (JSON.parse never returns the same object twice).
let cachedUserRaw: string | null = null
let cachedUser: LocalUser | null = null

export function getLocalUser(): LocalUser | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(USER_KEY)
  if (raw !== cachedUserRaw) {
    cachedUserRaw = raw
    cachedUser = raw ? JSON.parse(raw) : null
  }
  return cachedUser
}

export function setLocalUser(user: LocalUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event(LOCAL_USER_EVENT))
}

export function clearLocalUser(): void {
  localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new Event(LOCAL_USER_EVENT))
}

// For useSyncExternalStore — the native "storage" event only fires in other
// tabs, so same-tab writes need this custom event to notify subscribers.
export function subscribeLocalUser(callback: () => void): () => void {
  window.addEventListener("storage", callback)
  window.addEventListener(LOCAL_USER_EVENT, callback)
  return () => {
    window.removeEventListener("storage", callback)
    window.removeEventListener(LOCAL_USER_EVENT, callback)
  }
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
  const existing = getLocalGames().filter((g) => g.user_id === userId)
  if (existing.length > 0) return

  SEED_GAMES.forEach((g) => addLocalGame({ ...g, user_id: userId }))
}
