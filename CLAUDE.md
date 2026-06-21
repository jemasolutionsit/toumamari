# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Toumamari — bilingual (ES/EN) single-page site for booking Easter Island (Rapa Nui) tours. React SPA served by an Express server that also hosts the payment/booking API.

## Commands

- `npm run dev` — start Express + Vite middleware on http://localhost:3000 (runs `server.ts` via tsx)
- `npm run build` — `vite build` for the client, then esbuild bundles `server.ts` → `dist/server.cjs`
- `npm start` — run the production build (`node dist/server.cjs`); requires `NODE_ENV=production` to serve static `dist/`
- `npm run lint` — type-check only (`tsc --noEmit`). This is the only check; there is no test suite or ESLint.
- `npm run clean` — remove `dist`

## Architecture

**Single server, two roles** (`server.ts`): in dev it mounts Vite in middleware mode (SPA); in production it serves static `dist/` with a React-Router fallback to `index.html`. The same Express app exposes `/api/*` routes. PayPal endpoints (`/api/payments/create-order`, `/api/payments/webhook`) are stubs — payment + booking persistence is intended to run server-side here so secrets stay off the client.

**Routing** (`src/App.tsx`): React Router v7 with four routes — `/`, `/guia` (TravelGuide), `/impacto` (SocialImpact), `/terminos` (Terms). Most of the experience lives on Home.

**Global state via React Context** (wired in `src/main.tsx`):
- `LanguageProvider` (`src/i18n.tsx`) — hand-rolled i18n, not a library. A single `translations` object keyed `es`/`en` with a typed `Translations` interface. Default language `es`, switched in memory (no persistence/routing). Use `useLanguage()` → `{ language, setLanguage, t }`. Adding a string means adding the key to the `Translations` interface AND both `es` and `en` maps.
- `CartProvider` (`src/CartContext.tsx`) — in-memory cart, totals as `price * travelers`. Use `useCart()`.

**Tour data has two sources — be aware which one you're touching:**
- `src/data.ts` — `getTours(lang)` returns hardcoded bilingual `Tour[]`. The `Tour` interface here is the client-facing shape.
- `src/lib/api.ts` — `fetchTours(lang)` pulls from Supabase and maps `DbTour` → `Tour` via `dbTourToTour`. Note the category remap: DB `half_day | full_day | pack` → client `half-day | full-day | packs`.

**Supabase** (`src/lib/`): `supabase.ts` creates the anon client from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. `database.types.ts` defines `DbTour`, `DbBooking`, `DbContactMessage` (tables: `tours`, `bookings`, `contact_messages`). `api.ts` holds all queries — bilingual columns are suffixed `_es` / `_en`.

## Conventions

- React 19, TypeScript, Tailwind CSS v4 (via `@tailwindcss/vite`), Vite 6, `motion` for animation, `lucide-react` icons.
- Path alias `@/*` → repo root.
- `noEmit` is set; the build never type-emits — Vite/esbuild transpile.
- HMR is gated by `DISABLE_HMR` (set by AI Studio); leave `vite.config.ts` watch/HMR logic alone.

## Env

`.env.local` (gitignored). Keys: `GEMINI_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and server-side PayPal secrets (`PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`). Only `VITE_`-prefixed vars reach the client.
