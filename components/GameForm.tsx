"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Game, GameStatus } from "@/lib/supabase"

const CONSOLES = [
  "PlayStation 5", "PlayStation 4", "PlayStation 3",
  "Xbox Series X/S", "Xbox One", "Xbox 360",
  "Nintendo Switch", "Nintendo 3DS", "Wii U", "Wii",
  "PC", "iOS", "Android", "Other",
]

const STATUS_OPTIONS: { value: GameStatus; label: string }[] = [
  { value: "playing", label: "Currently Playing" },
  { value: "completed", label: "Completed" },
  { value: "dropped", label: "Dropped" },
  { value: "backlog", label: "Backlog" },
  { value: "wishlist", label: "Wishlist" },
]

type FormData = {
  title: string
  console: string
  status: GameStatus
  days_played: string
  start_date: string
  end_date: string
  rating: string
  notes: string
}

interface GameFormProps {
  initial?: Game
  onSubmit: (data: Omit<Game, "id" | "created_at" | "user_id">) => void
  onCancel: () => void
}

export default function GameForm({ initial, onSubmit, onCancel }: GameFormProps) {
  const [form, setForm] = useState<FormData>({
    title: initial?.title ?? "",
    console: initial?.console ?? "",
    status: (initial?.status as GameStatus) ?? "backlog",
    days_played: initial?.days_played?.toString() ?? "",
    start_date: initial?.start_date ?? "",
    end_date: initial?.end_date ?? "",
    rating: initial?.rating?.toString() ?? "",
    notes: initial?.notes ?? "",
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  function validate() {
    const e: Partial<FormData> = {}
    if (!form.title.trim()) e.title = "Title is required"
    if (!form.console) e.console = "Console is required"
    if (form.rating && (Number(form.rating) < 1 || Number(form.rating) > 10))
      e.rating = "Rating must be 1–10"
    if (form.days_played && Number(form.days_played) < 0)
      e.days_played = "Days must be positive"
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    onSubmit({
      title: form.title.trim(),
      console: form.console,
      status: form.status,
      days_played: form.days_played ? Number(form.days_played) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      rating: form.rating ? Number(form.rating) : null,
      notes: form.notes.trim() || null,
      cover_url: initial?.cover_url ?? null,
    })
  }

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Title */}
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="title">Game Title *</Label>
          <Input
            id="title"
            placeholder="e.g. The Legend of Zelda"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
          {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
        </div>

        {/* Console */}
        <div className="space-y-1.5">
          <Label>Console *</Label>
          <Select value={form.console} onValueChange={(v) => set("console", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select console" />
            </SelectTrigger>
            <SelectContent>
              {CONSOLES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.console && <p className="text-xs text-destructive">{errors.console}</p>}
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v as GameStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Days Played */}
        <div className="space-y-1.5">
          <Label htmlFor="days">Days Played</Label>
          <Input
            id="days"
            type="number"
            min="0"
            placeholder="e.g. 30"
            value={form.days_played}
            onChange={(e) => set("days_played", e.target.value)}
          />
          {errors.days_played && <p className="text-xs text-destructive">{errors.days_played}</p>}
        </div>

        {/* Rating */}
        <div className="space-y-1.5">
          <Label htmlFor="rating">Rating (1–10)</Label>
          <Input
            id="rating"
            type="number"
            min="1"
            max="10"
            placeholder="e.g. 9"
            value={form.rating}
            onChange={(e) => set("rating", e.target.value)}
          />
          {errors.rating && <p className="text-xs text-destructive">{errors.rating}</p>}
        </div>

        {/* Start Date */}
        <div className="space-y-1.5">
          <Label>Start Date</Label>
          <DatePicker
            value={form.start_date}
            onChange={(v) => set("start_date", v)}
            placeholder="Pick start date"
          />
        </div>

        {/* End Date */}
        <div className="space-y-1.5">
          <Label>End Date</Label>
          <DatePicker
            value={form.end_date}
            onChange={(v) => set("end_date", v)}
            placeholder="Pick end date"
          />
        </div>

        {/* Notes */}
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Thoughts, memorable moments, tips…"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? "Save Changes" : "Add Game"}</Button>
      </div>
    </form>
  )
}
