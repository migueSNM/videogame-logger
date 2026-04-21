"use client"

import { useState, useEffect, useCallback } from "react"
import { Game } from "./supabase"
import {
  getLocalGames, addLocalGame, updateLocalGame, deleteLocalGame, seedDemoGames
} from "./localStorage"

export function useGames(userId: string | null) {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    if (!userId) { setGames([]); setLoading(false); return }
    setGames(getLocalGames().filter((g) => g.user_id === userId))
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (userId) {
      seedDemoGames(userId)
      refresh()
    } else {
      setGames([])
      setLoading(false)
    }
  }, [userId, refresh])

  const addGame = useCallback((data: Omit<Game, "id" | "created_at" | "user_id">) => {
    if (!userId) return null
    const game = addLocalGame({ ...data, user_id: userId })
    setGames(getLocalGames().filter((g) => g.user_id === userId))
    return game
  }, [userId])

  const updateGame = useCallback((id: string, data: Partial<Game>) => {
    updateLocalGame(id, data)
    setGames(getLocalGames().filter((g) => g.user_id === userId))
  }, [userId])

  const removeGame = useCallback((id: string) => {
    deleteLocalGame(id)
    setGames(getLocalGames().filter((g) => g.user_id === userId))
  }, [userId])

  return { games, loading, addGame, updateGame, removeGame, refresh }
}
