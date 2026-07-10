# CLAUDE.md

This file provides guidance when working with code in this repository.

## Project

Toumamari — bilingual (ES/EN) site for booking Easter Island (Rapa Nui) tours. React SPA served by an Express server that also hosts the payment/booking API.

## Commands

- `npm run dev` — start Express + Vite middleware on http://localhost:3000 (runs `server.ts` via tsx)
- `npm run build` — `vite build` for the client, then esbuild bundles `server.ts` → `dist/server.cjs`
- `npm start` — run the production build (`node dist/server.cjs`); requires `NODE_ENV=production` to serve static `dist/`
- `npm run lint` — type-check only (`tsc --noEmit`). This is the only check; there is no test suite or ESLint.
- `npm run clean` — remove `dist`

## Architecture & Directory Layout

The project files have been reorganized into modular directories:
- `src/components/`
  - `Cart.tsx` — booking checkout flow (writes to Supabase, sends Resend email, links to WhatsApp).
  - `Layout.tsx` — site shell, footer, and navigation. Includes language & currency toggles.
  - `TourCard.tsx` — individual tour card with price formats and animations.
- `src/context/`
  - `CartContext.tsx` — cart logic, traveler counts, and currency state (CLP / USD).
  - `i18n.tsx` — bilingual translations provider (ES/EN).
- `src/data/`
  - `data.ts` — static tour metadata, reviews, FAQs, official WhatsApp contact info.
- `src/pages/`
  - `Home.tsx` — main landing page with tour grids, reviews, contact form, and teaser gallery.
  - `Gallery.tsx` — standalone full photo gallery page with categories and lightbox view.
  - `Admin.tsx` / `TravelGuide.tsx` / `SocialImpact.tsx` / `Terms.tsx` — supporting views.
- `src/lib/`
  - `api.ts` — queries to Supabase DB.
  - `whatsapp.ts` — WhatsApp message formatter for order checkout.

## Key Configurations & Features

1. **Currency Toggle (CLP / USD):** Caching is enabled for currency exchange rates fetched from `mindicador.cl`. Totals and breakdowns are dynamic throughout the app.
2. **Performance Optimizations:**
   - Client bundle splitting configured in `vite.config.ts` via `manualChunks` (splitting vendor, motion, supabase, and icons) to reduce initial load weight to ~107 kB.
   - High priority preloading (`fetchpriority="high"`) configured for LCP resources.
   - Re-compressed WebP assets under `public/images` to minimize page loading footprint (reduction of ~47% of image weight).
3. **PWA (iOS Compatibility):**
   - Implemented standard Vite PWA cache.
   - Configured specific Safari iOS meta tags (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, etc.) in `index.html` to support proper "Add to Home Screen" fullscreen execution on iPhone.
4. **Build & Deploy:**
   - Deployed on Vercel via `jemasolutionsit/toumamari` project (`prj_PTIyOWTCFktGqamoKtk7yeLbsbgQ`).
   - `sharp` is listed in `optionalDependencies` to prevent native binary installation failures in Vercel's Linux build containers.

## Env

`.env.local` keys: `GEMINI_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`.
Only `VITE_` prefixed variables are exposed to the client and inlined during build.
