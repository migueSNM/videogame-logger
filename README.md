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
