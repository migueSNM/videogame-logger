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

---

## Tech stack

- [Next.js 16](https://nextjs.org/) — App Router, static export
- [shadcn/ui](https://ui.shadcn.com/) — component library built on Radix UI
- [Tailwind CSS v4](https://tailwindcss.com/)
- [react-day-picker](https://react-day-picker.js.org/) — calendar picker
- [Lucide React](https://lucide.dev/) — icons
- `localStorage` — client-side persistence per browser

---

## Architecture

### Project structure

```
app/
  layout.tsx        # Root layout — fonts, metadata, global styles
  page.tsx          # Single route — auth gate, renders LoginPage or Dashboard
  globals.css       # Tailwind base styles

components/
  LoginPage.tsx     # Email sign-in form
  Dashboard.tsx     # Library grid, stats cards, search & filter toolbar
  GameCard.tsx      # Individual game tile with edit/delete actions
  GameForm.tsx      # Add/edit form with validation and date pickers
  ui/               # shadcn/ui primitives (Button, Dialog, Badge, Select, etc.)

lib/
  supabase.ts       # Type definitions for Game and GameStatus (no active Supabase connection)
  localStorage.ts   # Read/write helpers for user and game data
  useGames.ts       # Custom React hook — CRUD operations over localStorage
  utils.ts          # Tailwind class merging utility (cn)
```

---

### How Next.js is used — feature by feature

#### App Router and file-based routing

Next.js 16 uses the **App Router**, where the file system defines your routes. Every folder inside `app/` that contains a `page.tsx` becomes a URL. This project has a single route:

```
app/page.tsx  →  /
```

That one file is the entire application. Next.js automatically wires the URL to the component — no manual router config needed. The root `app/layout.tsx` wraps every page with shared structure (fonts, `<html>` attributes, global CSS), and Next.js guarantees it renders once per navigation tree.

#### Server Components vs. Client Components

One of App Router's core ideas is that components are **Server Components by default** — they render on the server (or at build time for static exports) and send zero JavaScript to the browser. You opt into client-side interactivity by adding `"use client"` at the top of a file.

In this app:

- `app/layout.tsx` is a **Server Component**. It has no interactivity — it just sets fonts and metadata. Next.js renders it once at build time and ships the result as static HTML.
- `app/page.tsx` and all components under `components/` are **Client Components** (`"use client"`). They need `useState`, `useEffect`, and direct access to `localStorage`, which are browser-only APIs — none of which work on the server.

This boundary is important: by keeping `layout.tsx` as a Server Component, the font and metadata setup stays out of the JavaScript bundle. The client tree starts at `page.tsx`.

#### Static export

`next.config.ts` sets `output: "export"`, which tells Next.js to produce a fully static site at build time:

```ts
const nextConfig: NextConfig = {
  output: "export",
  // ...
}
```

Instead of running a Node.js server, `next build` emits a plain `out/` directory of HTML, CSS, and JS files — the same output you'd get from a static site generator. This is how the app is deployed to GitHub Pages with zero server infrastructure.

**Trade-off:** static export means no server-side rendering per request and no API routes. That constraint is fine here since all data lives in `localStorage`.

#### Metadata API

Rather than manually writing `<meta>` tags in HTML, Next.js exposes a typed `Metadata` object that you export from any layout or page:

```ts
// app/layout.tsx
export const metadata: Metadata = {
  title: "Videogame Logger",
  description: "Track your gaming journey — log games, consoles, and time played.",
}
```

Next.js reads this at build time and injects the correct `<title>` and `<meta>` tags into the static HTML. It also handles Open Graph, Twitter cards, and canonical URLs through the same API when needed.

#### next/font — optimized font loading

Fonts are loaded through `next/font/google` in `app/layout.tsx`:

```ts
import { Geist, Geist_Mono } from "next/font/google"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })
```

`next/font` downloads the font files at **build time**, self-hosts them alongside your static assets, and injects them with zero network requests to Google at runtime. It also generates CSS variables (e.g. `--font-geist-sans`) that Tailwind can reference. The result: no flash of unstyled text, no external font requests, and no privacy concerns from third-party DNS lookups.

#### Path aliases

TypeScript and Next.js are configured to resolve `@/` as the project root:

```ts
import { useGames } from "@/lib/useGames"
import Dashboard from "@/components/Dashboard"
```

This is configured in `tsconfig.json` and respected by the Next.js compiler. It prevents brittle relative import chains like `../../../lib/useGames` and makes refactoring across directories safe.

#### basePath and assetPrefix for sub-path deployment

GitHub Pages hosts the app at `https://miguesnm.github.io/videogame-logger/` — a sub-path, not a root domain. Without configuration, all asset URLs (JS bundles, CSS, images) would be relative to `/` and 404. `next.config.ts` handles this:

```ts
const isProd = process.env.NODE_ENV === "production"
const repoName = isProd ? (process.env.NEXT_PUBLIC_BASE_PATH ?? "") : ""

const nextConfig: NextConfig = {
  basePath: repoName ? `/${repoName}` : "",
  assetPrefix: repoName ? `/${repoName}/` : "",
  trailingSlash: true,
  images: { unoptimized: true },
}
```

- `basePath` prefixes all internal links and routes.
- `assetPrefix` prefixes all static asset URLs in the generated HTML.
- `NEXT_PUBLIC_BASE_PATH` is set to `videogame-logger` in the GitHub Actions workflow, so the values are injected at build time without affecting local development.
- `images: { unoptimized: true }` is required for static exports because the Next.js Image Optimization API needs a running server.

---

### Data flow

The app has no backend. All state flows through a single custom hook:

```
localStorage  ←→  lib/localStorage.ts  ←→  lib/useGames.ts  ←→  Dashboard / GameCard / GameForm
```

1. `lib/localStorage.ts` is a thin wrapper around `window.localStorage` — it reads/writes JSON and handles the `typeof window === "undefined"` guard needed during Next.js's server-side pass at build time.
2. `lib/useGames.ts` is a `"use client"` hook that owns the in-memory `games` state and exposes `addGame`, `updateGame`, `removeGame`. Every mutation writes to `localStorage` and re-syncs state, so the UI stays in sync without any global store.
3. `app/page.tsx` reads the current user from `localStorage` on mount via `useEffect`. The `mounted` guard (`if (!mounted) return null`) prevents a hydration mismatch between the server-rendered HTML (which has no `localStorage`) and the client.

---

## Running locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

### Environment variables

No environment variables are required to run locally. The `NEXT_PUBLIC_BASE_PATH` variable is only needed for sub-path deployments (like GitHub Pages) and is set automatically by the CI workflow.

### Building for production

```bash
npm run build
# Outputs a static site to out/
```

To preview the production build locally:

```bash
npx serve out
```

### Linting

```bash
npm run lint
```

---

## Developer guide

### Adding a new game field

1. Add the field to the `Game` type in `lib/supabase.ts`.
2. Add the input to `components/GameForm.tsx`.
3. Display it in `components/GameCard.tsx` if it should be visible on the card.
4. No migration needed — `localStorage` is schema-less; existing entries will simply have the field as `undefined` until edited.

### Adding a new route

Create `app/<route-name>/page.tsx`. Next.js picks it up automatically. If the page needs browser APIs, add `"use client"` at the top. If it's purely static content (no interactivity), leave it as a Server Component.

### Swapping localStorage for a real backend

The `lib/localStorage.ts` and `lib/useGames.ts` files are the only layer that touches storage. To connect a real database:

1. Replace the functions in `lib/localStorage.ts` with API calls (or Supabase queries — the client and types are already scaffolded in `lib/supabase.ts`).
2. Convert `lib/useGames.ts` to async (add `async/await` and loading states as needed).
3. Remove `output: "export"` from `next.config.ts` so Next.js can run as a server and handle API routes or server actions.

---

## Deployment

Pushes to `main` automatically deploy to GitHub Pages via the included GitHub Actions workflow (`.github/workflows/`).

To deploy to your own repo:

1. Fork / clone this repo
2. In your repo settings → Pages → Source: select **GitHub Actions**
3. In the workflow file, update `NEXT_PUBLIC_BASE_PATH` to match your repository name
4. Push to `main` — the workflow handles the rest

The live URL will be `https://<your-username>.github.io/<repo-name>/`
