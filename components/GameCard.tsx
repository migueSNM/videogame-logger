"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Game, GameStatus } from "@/lib/supabase"
import GameForm from "./GameForm"
import {
  Gamepad2, Calendar, Clock, Star, Pencil, Trash2, StickyNote,
} from "lucide-react"

const STATUS_CONFIG: Record<GameStatus, { label: string; variant: "success" | "info" | "warning" | "secondary" | "outline" }> = {
  completed: { label: "Completed", variant: "success" },
  playing: { label: "Playing", variant: "info" },
  dropped: { label: "Dropped", variant: "warning" },
  backlog: { label: "Backlog", variant: "secondary" },
  wishlist: { label: "Wishlist", variant: "outline" },
}

const CONSOLE_ICONS: Record<string, string> = {
  "PlayStation 5": "PS5",
  "PlayStation 4": "PS4",
  "PlayStation 3": "PS3",
  "Xbox Series X/S": "XSX",
  "Xbox One": "XBO",
  "Xbox 360": "X360",
  "Nintendo Switch": "NSW",
  "Nintendo 3DS": "3DS",
  "Wii U": "WiiU",
  Wii: "Wii",
  PC: "PC",
  iOS: "iOS",
  Android: "APK",
  Other: "???",
}

interface GameCardProps {
  game: Game
  onUpdate: (id: string, data: Partial<Game>) => void
  onDelete: (id: string) => void
}

export default function GameCard({ game, onUpdate, onDelete }: GameCardProps) {
  const [editing, setEditing] = useState(false)
  const status = STATUS_CONFIG[game.status] ?? STATUS_CONFIG.backlog

  function handleUpdate(data: Omit<Game, "id" | "created_at" | "user_id">) {
    onUpdate(game.id, data)
    setEditing(false)
  }

  const stars = game.rating
    ? Array.from({ length: 10 }, (_, i) => i < game.rating! ? "★" : "☆").join("")
    : null

  return (
    <>
      <Card className="group hover:shadow-lg hover:border-primary/30 transition-all duration-200 bg-card">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant={status.variant}>{status.label}</Badge>
                <span className="text-xs font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                  {CONSOLE_ICONS[game.console] ?? game.console}
                </span>
              </div>
              <h3 className="font-semibold text-base leading-tight truncate mt-2">{game.title}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{game.console}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete &ldquo;{game.title}&rdquo;?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-white hover:bg-destructive/90"
                      onClick={() => onDelete(game.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {game.days_played != null && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {game.days_played} day{game.days_played !== 1 ? "s" : ""}
              </span>
            )}
            {game.start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(game.start_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {game.end_date && (
                  <> → {new Date(game.end_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</>
                )}
              </span>
            )}
            {stars && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span className="text-yellow-500 tracking-tight">{game.rating}/10</span>
              </span>
            )}
          </div>

          {game.notes && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2 flex gap-1 items-start">
              <StickyNote className="h-3 w-3 mt-0.5 shrink-0" />
              {game.notes}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Game</DialogTitle>
          </DialogHeader>
          <GameForm
            initial={game}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
