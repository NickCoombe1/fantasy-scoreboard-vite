# Fantasy Scoreboard

A fantasy football scoring dashboard for the Premier League Draft game. View your team's live scores, player stats, and league matchups during gameweeks.

Built with Vite, React 19, TanStack Router, and TanStack Query. Data is sourced from the Premier League Draft API via Vercel serverless functions.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Local Development

```bash
npm run dev
```

This starts the Vite dev server at `http://localhost:5173`.

**Note:** The API proxy functions in `/api` are Vercel serverless functions and don't run locally with `npm run dev`. To test with the full API layer locally, use:

```bash
npx vercel dev
```

This requires the [Vercel CLI](https://vercel.com/docs/cli) and a linked Vercel project.

### Build

```bash
npm run build
```

Output goes to `dist/`.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
  routes/          # TanStack Router file-based routes
  components/      # React components (common, scoring, svg, utility)
  api/             # TanStack Query hooks and fetch helpers
  models/          # TypeScript interfaces
  hooks/           # Custom hooks (useTheme, displayElementType)
  lib/             # Business logic (auto-subs, cookies)
  styles/          # Global CSS and font declarations
api/               # Vercel serverless functions (PL API proxy)
public/            # Static assets, fonts, favicons
```

## Tech Stack

- **Vite** - Build tooling
- **React 19** - UI
- **TanStack Router** - File-based, type-safe routing
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Styling
- **Headless UI** - Accessible component primitives
- **Vercel** - Deployment and serverless functions

## Deployment

Deployed on Vercel. Push to `main` to trigger a deploy. The `/api` directory is automatically picked up as serverless functions.
