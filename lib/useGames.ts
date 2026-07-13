"use client"

import { useState, useEffect, useCallback } from "react"
import { Game } from "./supabase/types"
import {
  getLocalGames, addLocalGame, updateLocalGame, deleteLocalGame, seedDemoGames
} from "./localStorage"
import { createClient } from "./supabase/client"
import { SEED_GAMES } from "./seedGames"

async function seedDemoGamesSupabase(userId: string): Promise<void> {
  const supabase = createClient()
  const { count } = await supabase
    .from("games")
    .select("id", { count: "exact", head: true })
  if (count && count > 0) return

  await supabase.from("games").insert(
    SEED_GAMES.map((g) => ({ ...g, user_id: userId }))
  )
}

export function useGames(userId: string | null, source: "local" | "supabase" = "local") {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!userId) return
    if (source === "local") {
      setGames(getLocalGames().filter((g) => g.user_id === userId))
      setLoading(false)
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: false })
    if (!error) setGames(data ?? [])
    setLoading(false)
  }, [userId, source])

  useEffect(() => {
    if (!userId) return

    if (source === "local") {
      seedDemoGames(userId)
      // Deferred a tick (rather than called inline) so this matches the
      // supabase branch below and doesn't setState synchronously in the effect.
      Promise.resolve().then(refresh)
      return
    }

    seedDemoGamesSupabase(userId).then(refresh)
  }, [userId, source, refresh])

  const addGame = useCallback(async (data: Omit<Game, "id" | "created_at" | "user_id">) => {
    if (!userId) return null

    if (source === "local") {
      const game = addLocalGame({ ...data, user_id: userId })
      setGames(getLocalGames().filter((g) => g.user_id === userId))
      return game
    }

    const supabase = createClient()
    const { data: inserted, error } = await supabase
      .from("games")
      .insert({ ...data, user_id: userId })
      .select()
      .single()
    if (!error && inserted) setGames((prev) => [inserted, ...prev])
    return inserted ?? null
  }, [userId, source])

  const updateGame = useCallback(async (id: string, data: Partial<Game>) => {
    if (source === "local") {
      updateLocalGame(id, data)
      setGames(getLocalGames().filter((g) => g.user_id === userId))
      return
    }

    const supabase = createClient()
    // Row-level security scopes this update to the caller's own games —
    // an explicit user_id filter here would be redundant (and just as
    // spoofable as the row id), so the DB policy is the real boundary.
    const { data: updated, error } = await supabase
      .from("games")
      .update(data as Partial<Omit<Game, "id" | "created_at">>)
      .eq("id", id)
      .select()
      .single()
    if (!error && updated) setGames((prev) => prev.map((g) => (g.id === id ? updated : g)))
  }, [userId, source])

  const removeGame = useCallback(async (id: string) => {
    if (source === "local") {
      deleteLocalGame(id)
      setGames(getLocalGames().filter((g) => g.user_id === userId))
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from("games").delete().eq("id", id)
    if (!error) setGames((prev) => prev.filter((g) => g.id !== id))
  }, [userId, source])

  return {
    games: userId ? games : [],
    loading: userId ? loading : false,
    addGame,
    updateGame,
    removeGame,
    refresh,
  }
}
