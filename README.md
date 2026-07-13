# Videogame Logger

Track your gaming journey — log every game you play, which console you played it on, how long it took, and how you felt about it.

**Live demo → [https://videogame-logger.vercel.app](https://videogame-logger.vercel.app)**

---

## Features

- **Real accounts** — email/password sign-up (with email confirmation) and "Continue with Google" via Supabase Auth
- **Try it for free** — a fully local trial mode (no account needed), capped at 10 games, stored only in the browser
- **Game library** — grid view with status badges, console tags, ratings, and notes
- **Stats dashboard** — total games, completions, days played, and consoles used
- **Search & filters** — filter by title, status (Playing / Completed / Dropped / Backlog / Wishlist), and console
- **Calendar date picker** — pick start and end dates with a popover calendar
- **Add / Edit / Delete** — full form with title, console, status, days played, rating (1–10), dates, and notes
- **Demo data** — 5 sample games pre-loaded the first time you sign in or try the trial
- **Dark mode** by default

---

## Tech stack

- [Next.js 16](https://nextjs.org/) — App Router, server-rendered (no static export)
- [Supabase](https://supabase.com/) — Auth (email/password + Google OAuth) and Postgres, accessed via `@supabase/ssr`
- [shadcn/ui](https://ui.shadcn.com/) — component library built on Radix UI
- [Tailwind CSS v4](https://tailwindcss.com/)
- [react-day-picker](https://react-day-picker.js.org/) — calendar picker
- [Lucide React](https://lucide.dev/) — icons
- `localStorage` — client-side persistence for trial mode only

---

## Architecture

### Project structure

```
app/
  layout.tsx            # Root layout — fonts, metadata, global styles
  page.tsx               # Single route — session state (none/trial/supabase), renders LandingPage or Dashboard
  globals.css             # Tailwind base styles
  auth/
    callback/route.ts     # OAuth code-exchange endpoint Google/Supabase redirect back to

components/
  LandingPage.tsx    # Hero + "Try it for free" / email+password sign-in-sign-up / "Continue with Google"
  Dashboard.tsx       # Library grid, stats cards, search & filter toolbar, trial cap UI
  GameCard.tsx         # Individual game tile with edit/delete actions
  GameForm.tsx         # Add/edit form with validation and date pickers
  ui/                     # shadcn/ui primitives (Button, Dialog, Badge, Select, etc.)

lib/
  supabase/
    types.ts       # Game, GameStatus, Database types (source of truth for the games table shape)
    client.ts        # Browser Supabase client (Client Components)
    server.ts         # Server Supabase client (Route Handlers, proxy — uses cookies())
  localStorage.ts  # Read/write helpers for trial-mode user and game data
  useGames.ts        # Custom hook — dispatches CRUD to localStorage (trial) or Supabase (real accounts)
  seedGames.ts       # The 5 sample games shared by both trial and real-account seeding
  utils.ts             # Tailwind class merging utility (cn)

proxy.ts              # Refreshes the Supabase session cookie on every request (Next.js 16's middleware equivalent)
supabase/
  schema.sql        # `games` table + row-level security policies — run once in the Supabase SQL Editor
```

---

### How Next.js is used — feature by feature

#### App Router and file-based routing

Next.js 16 uses the **App Router**, where the file system defines your routes:

```
app/page.tsx                →  /
app/auth/callback/route.ts  →  /auth/callback  (GET only, used by the OAuth redirect)
```

The root `app/layout.tsx` wraps every page with shared structure (fonts, `<html>` attributes, global CSS).

#### Server Components vs. Client Components

Components are **Server Components by default** — you opt into client-side interactivity with `"use client"`.

- `app/layout.tsx` is a **Server Component** — no interactivity, just fonts and metadata.
- `app/page.tsx` and everything under `components/` are **Client Components**. They need `useState`, `useEffect`, browser `localStorage`, and the Supabase browser client.
- `app/auth/callback/route.ts` is a **Route Handler** — plain server-side code with no client/server component distinction; it runs once per OAuth redirect and never ships JS to the browser.

#### Route Handlers

`app/auth/callback/route.ts` exports a `GET` function that receives the OAuth `code` Google/Supabase redirect back with, exchanges it for a session via the server Supabase client, and redirects to `/`. This is the standard Supabase "PKCE" flow for App Router — it needs a real server request/response cycle, which is why this app can no longer be statically exported (see below).

#### Proxy (Next.js 16's renamed middleware)

**Next.js 16 renamed `middleware.ts` to `proxy.ts`**, exporting a function named `proxy` (not `middleware`) and a config named `proxyConfig` (not `config`). `proxy.ts` at the project root runs on every matched request, refreshing the Supabase auth cookie via `supabase.auth.getUser()` so that sessions stay valid across navigations. This app has no protected routes to gate — its only job here is keeping the session fresh.

#### No more static export

Earlier versions of this project used `output: "export"` to produce a static site deployable to GitHub Pages. Real Supabase Auth needs cookies, a Route Handler for the OAuth callback, and proxy-based session refresh — none of which work under static export (Next.js explicitly disables all three in that mode). `next.config.ts` is now just the default config, and the app runs as a normal Next.js server on Vercel.

#### Metadata API

```ts
// app/layout.tsx
export const metadata: Metadata = {
  title: "Videogame Logger",
  description: "Track your gaming journey — log games, consoles, and time played.",
}
```

Next.js reads this and injects the correct `<title>` and `<meta>` tags.

#### next/font — optimized font loading

Fonts are loaded through `next/font/google` in `app/layout.tsx`, self-hosted at build time with zero runtime requests to Google.

#### Path aliases

`@/` resolves to the project root (configured in `tsconfig.json`), e.g. `import { useGames } from "@/lib/useGames"`.

---

### Data flow

There are two independent data sources, chosen per-session by `app/page.tsx`:

```
Trial:    localStorage  ←→  lib/localStorage.ts  ←→  lib/useGames.ts  ←→  Dashboard / GameCard / GameForm
Real:     Supabase Postgres (RLS-scoped)  ←→  lib/supabase/client.ts  ←→  lib/useGames.ts  ←→  Dashboard / GameCard / GameForm
```

1. `app/page.tsx` holds a `Session` discriminated union: `{ kind: "none" }`, `{ kind: "trial"; user }`, or `{ kind: "supabase"; user }`. On mount it checks `localStorage` first (an active trial takes priority), otherwise asks Supabase for the current user and subscribes to `onAuthStateChange` to react to sign-in/sign-out/OAuth completion.
2. `lib/useGames.ts` is a single hook, `useGames(userId, source)`, that dispatches every CRUD call to either `lib/localStorage.ts` (trial) or `supabase.from("games")` (real accounts) depending on `source`. `Dashboard.tsx` doesn't know or care which backend it's talking to — it always gets back `{ games, loading, addGame, updateGame, removeGame }`.
3. For Supabase, per-user data isolation is enforced by **Postgres row-level security** (`supabase/schema.sql`), not by client-side filtering — every policy checks `auth.uid() = user_id`, so even a compromised client can't read or write another user's rows.
4. New real accounts and new trial sessions both get seeded with the same 5 sample games from `lib/seedGames.ts` the first time they have zero games.

---

## Running locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

"Try it for free" works immediately with no setup. To use real "Sign in":

### Environment variables

Create a Supabase project, then set in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
```

### Supabase setup

1. Run `supabase/schema.sql` in the Supabase Dashboard → SQL Editor to create the `games` table and its row-level security policies.
2. **Google OAuth**: in Google Cloud Console, create an OAuth Client ID (Web application) with authorized redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`. In Supabase Dashboard → Authentication → Providers → Google, paste the Client ID/Secret.
3. In Supabase Dashboard → Authentication → URL Configuration, set **Site URL** to your app's URL and add `<your-url>/auth/callback` (including `http://localhost:3000/auth/callback` for local dev) to **Redirect URLs**.
4. Email confirmation is left on by default — new sign-ups get a confirmation email before they can sign in.

### Linting

```bash
npm run lint
```

---

## Developer guide

### Adding a new game field

1. Add the field to the `Game` type in `lib/supabase/types.ts`.
2. Add the column to `supabase/schema.sql` and run the `ALTER TABLE` in the Supabase SQL Editor.
3. Add the input to `components/GameForm.tsx`.
4. Display it in `components/GameCard.tsx` if it should be visible on the card.

### Adding a new route

Create `app/<route-name>/page.tsx` (or `route.ts` for an API endpoint). Next.js picks it up automatically.

---

## Deployment

Deployed on [Vercel](https://vercel.com/) — connect the repo and pushes to `main` deploy automatically, no workflow file needed.

1. Import the repo into Vercel.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Project Settings → Environment Variables (Production, Preview, and Development).
3. Once you know the production domain, update Supabase Dashboard → Authentication → URL Configuration with the real Site URL and `/auth/callback` redirect URL.
4. Google OAuth is only allowlisted for the production domain — it won't work on Vercel preview deployments (email/password and trial mode still do).
