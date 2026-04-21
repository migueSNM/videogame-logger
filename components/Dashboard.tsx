"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import GameCard from "./GameCard"
import GameForm from "./GameForm"
import { Game, GameStatus } from "@/lib/supabase"
import { useGames } from "@/lib/useGames"
import { clearLocalUser } from "@/lib/localStorage"
import {
  Gamepad2, Plus, Search, LogOut, Trophy, Clock, Monitor, TrendingUp,
} from "lucide-react"

const STATUS_FILTERS: { value: GameStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "playing", label: "Playing" },
  { value: "completed", label: "Completed" },
  { value: "dropped", label: "Dropped" },
  { value: "backlog", label: "Backlog" },
  { value: "wishlist", label: "Wishlist" },
]

interface DashboardProps {
  userId: string
  userEmail: string
  onLogout: () => void
}

export default function Dashboard({ userId, userEmail, onLogout }: DashboardProps) {
  const { games, loading, addGame, updateGame, removeGame } = useGames(userId)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<GameStatus | "all">("all")
  const [consoleFilter, setConsoleFilter] = useState("all")
  const [addOpen, setAddOpen] = useState(false)

  const consoles = useMemo(() => {
    const set = new Set(games.map((g) => g.console))
    return ["all", ...Array.from(set).sort()]
  }, [games])

  const filtered = useMemo(() => {
    return games.filter((g) => {
      const matchSearch = g.title.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === "all" || g.status === statusFilter
      const matchConsole = consoleFilter === "all" || g.console === consoleFilter
      return matchSearch && matchStatus && matchConsole
    })
  }, [games, search, statusFilter, consoleFilter])

  const stats = useMemo(() => {
    const completed = games.filter((g) => g.status === "completed")
    const totalDays = games.reduce((sum, g) => sum + (g.days_played ?? 0), 0)
    const avgRating = completed.filter((g) => g.rating).reduce((sum, g) => sum + (g.rating ?? 0), 0) /
      (completed.filter((g) => g.rating).length || 1)
    const consoleCount = new Set(games.map((g) => g.console)).size
    return { total: games.length, completed: completed.length, totalDays, avgRating, consoleCount }
  }, [games])

  function handleAdd(data: Omit<Game, "id" | "created_at" | "user_id">) {
    addGame(data)
    setAddOpen(false)
  }

  function handleLogout() {
    clearLocalUser()
    onLogout()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Videogame Logger</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">{userEmail}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={<Gamepad2 className="h-4 w-4" />} label="Total Games" value={stats.total} />
          <StatCard icon={<Trophy className="h-4 w-4 text-yellow-500" />} label="Completed" value={stats.completed} />
          <StatCard icon={<Clock className="h-4 w-4 text-blue-500" />} label="Days Played" value={stats.totalDays} />
          <StatCard icon={<Monitor className="h-4 w-4 text-purple-500" />} label="Consoles" value={stats.consoleCount} />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search games…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as GameStatus | "all")}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={consoleFilter} onValueChange={setConsoleFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {consoles.map((c) => (
                <SelectItem key={c} value={c}>{c === "all" ? "All Consoles" : c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shrink-0">
                <Plus className="h-4 w-4" />
                Add Game
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Log a New Game</DialogTitle>
              </DialogHeader>
              <GameForm onSubmit={handleAdd} onCancel={() => setAddOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "game" : "games"}
          </span>
          {(statusFilter !== "all" || consoleFilter !== "all" || search) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => { setSearch(""); setStatusFilter("all"); setConsoleFilter("all") }}
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Game Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onAdd={() => setAddOpen(true)} hasGames={games.length > 0} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onUpdate={updateGame}
                onDelete={removeGame}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-1.5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function EmptyState({ onAdd, hasGames }: { onAdd: () => void; hasGames: boolean }) {
  return (
    <div className="text-center py-20 space-y-4">
      <div className="flex justify-center">
        <div className="p-5 rounded-2xl bg-muted">
          <Gamepad2 className="h-10 w-10 text-muted-foreground" />
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-lg">
          {hasGames ? "No games match your filters" : "Your library is empty"}
        </h3>
        <p className="text-muted-foreground text-sm mt-1">
          {hasGames ? "Try adjusting your search or filters." : "Start by logging a game you've played."}
        </p>
      </div>
      {!hasGames && (
        <Button onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add your first game
        </Button>
      )}
    </div>
  )
}
