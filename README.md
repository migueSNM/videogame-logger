# Videogame Logger

Track your gaming journey — log every game you play, which console you played it on, how long it took, and how you felt about it.

**Live demo → [https://miguesnm.github.io/videogame-logger/](https://miguesnm.github.io/videogame-logger/)**

---

## Features

- **Email sign-in** — enter any email to get your own isolated library
- **Game library** — grid view with status badges, console tags, ratings, and notes
- **Stats dashboard** — total games, completions, days played, and consoles used
- **Search & filters** — filter by title, status (Playing / Completed / Dropped / Backlog / Wishlist), and console
- **Calendar date picker** — pick start and end dates with a popover calendar
- **Add / Edit / Delete** — full form with title, console, status, days played, rating (1–10), dates, and notes
- **Demo data** — 5 sample games pre-loaded on first sign-in
- **Dark mode** by default

## Tech stack

- [Next.js 16](https://nextjs.org/) — static export (`output: "export"`)
- [shadcn/ui](https://ui.shadcn.com/) — component library built on Radix UI
- [Tailwind CSS v4](https://tailwindcss.com/)
- [react-day-picker](https://react-day-picker.js.org/) — calendar picker
- [Lucide React](https://lucide.dev/) — icons
- `localStorage` — client-side persistence per browser

## Architecture

The app is a single-page application built on Next.js 16's App Router, configured as a fully static export (`output: "export"`). There is one route — `app/page.tsx` — which acts as the shell: it reads the current user from `localStorage` on mount and renders either the `LoginPage` or the `Dashboard` component. The entire app is a Client Component tree (`"use client"`), meaning no server-side rendering or API routes are involved; Next.js is used purely for its build pipeline, file-based routing, and static asset handling.

```
app/
  layout.tsx        # Root layout (fonts, global CSS)
  page.tsx          # Entry point — auth gate, renders LoginPage or Dashboard
  globals.css       # Tailwind base styles

components/
  LoginPage.tsx     # Email sign-in form
  Dashboard.tsx     # Library view, stats, search/filter
  GameCard.tsx      # Individual game tile
  GameForm.tsx      # Add / edit form with date picker
  ui/               # shadcn/ui primitives (Button, Dialog, Badge, etc.)

lib/
  localStorage.ts   # Read/write helpers for user and game data
  useGames.ts       # Custom hook — CRUD operations over localStorage
  utils.ts          # Tailwind class merging utility
```

At build time, Next.js emits a fully static `out/` directory. The `basePath` and `assetPrefix` in `next.config.ts` are set dynamically via the `NEXT_PUBLIC_BASE_PATH` environment variable so the same build config works both locally and when deployed to a GitHub Pages sub-path.

## Running locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Deployment

Pushes to `main` automatically deploy to GitHub Pages via the included GitHub Actions workflow.

To deploy to your own repo:
1. Fork / clone this repo
2. In your repo settings → Pages → Source: select **GitHub Actions**
3. Push to `main` — the workflow handles the rest

The live URL will be `https://<your-username>.github.io/videogame-logger/`
