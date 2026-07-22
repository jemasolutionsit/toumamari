# CLAUDE.md

This file provides guidance when working with code in this repository.

## Project

Touamamari — bilingual (ES/EN) site for booking Easter Island (Rapa Nui) tours. React SPA served by an Express server that also hosts the payment/booking API.

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
  - `TravelGuide.tsx` / `SocialImpact.tsx` / `Terms.tsx` — supporting views.
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
   - Deployed on Vercel via `jemasolutionsit/touamamari` project (`prj_PTIyOWTCFktGqamoKtk7yeLbsbgQ`); production URL https://www.touamamari.cl (touamamari.vercel.app and toumamari.vercel.app remain as aliases). Domain DNS is on Vercel nameservers; touamamari.cl is verified in Resend (emails send from noreply@touamamari.cl).
   - `sharp` is listed in `optionalDependencies` to prevent native binary installation failures in Vercel's Linux build containers.

## Env

`.env.local` keys: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` (optional: `NOTIFY_EMAIL`).
Only `VITE_` prefixed variables are exposed to the client and inlined during build.

## Docs

Client-facing documentation (pending items, contact data) lives in `docs/PARA-EL-CLIENTE.md`.

## Estado del proyecto (traspaso de sesión — 2026-07-22)

El trabajo hasta acá se hizo en Windows; el usuario cambia a un Mac y no va a reabrir
este directorio. Todo lo que importa está commiteado y pusheado a `main` en
`github.com/jemasolutionsit/touamamari` — al clonar el repo en el Mac, Claude Code
carga este archivo automáticamente y recupera el contexto. Lo que **no** viaja solo:

- **`.env.local`** no está en git (correctamente, ver `.gitignore`). Vercel ya tiene
  `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_ANON_KEY` en production/preview — para desarrollar local en el Mac,
  copiar `.env.example` a `.env.local` y pedirle los valores al usuario o sacarlos del
  dashboard de Vercel (`vercel env pull` si el CLI está logueado).
- **El skill `ui-ux-pro-max`** vive en `~/.claude/skills/` de esta máquina Windows
  (instalado el 14-07 desde `github.com/nextlevelbuilder/ui-ux-pro-max-skill`, requiere
  Python 3). Hay una copia de sus datos en `.agents/skills/` dentro del repo (quedó de
  un intento anterior con su CLI) pero **no es invocable así** — si se quiere usar en
  el Mac hay que instalarlo de nuevo ahí.
- La memoria de Claude Code (aprendizajes tipo "no asumir el correo del negocio sin
  confirmar") vive en `~/.claude/projects/.../memory/` de este PC y no se sincroniza
  sola a otra máquina.

### Qué está resuelto y en producción

- **Correo del negocio: `info.touamamari@gmail.com`** (Gmail creado por el cliente el
  14-07). `OWNER_EMAILS` en `api/_lib/store.ts` es el único lugar que define el
  destinatario de avisos (acepta `NOTIFY_EMAIL` con lista separada por comas).
  `notifyOwner` manda **un envío de Resend por destinatario** (no una lista compartida)
  para que el rebote de una casilla no oculte si otra sí recibió — lección del correo
  `.com` anterior, que quedaba suspendido y hacía "bounce" a todo el lote.
- **Dominio oficial: `www.touamamari.cl`.** `touamamari.com` (con "u") quedó abandonado:
  el registrador (Squarespace) lo puso en `clientHold` y nunca se destrabó.
- **WhatsApp de ventas confirmado:** `+56 9 5760 9175` (en `CONTACT_INFO`, `data.ts`).
- **Redes sociales:** se retiraron los íconos de Instagram/Facebook del footer
  (commit `fc4a6c8`) — las cuentas nunca se confirmaron como reales. Si el cliente
  entrega usuarios reales, hay que agregarlas de vuelta en `Layout.tsx`.
- **Diseño de transiciones (2026-07-22):** las secciones claras/oscuras de `Home.tsx`
  usan un fundido con curva ease-in-out (`SectionBridge`) en vez de una costura corta
  — la versión anterior se veía como una línea/destello blanco entre secciones. Al
  navegar entre páginas hay un velo con el rombo dorado de la marca (`App.tsx`,
  `RouteTransition`) que además corrige que React Router no volvía el scroll al tope.
- PWA probada en iPhone real, RLS + backend-insert pattern para contacto/reservas
  funcionando, react-doctor limpio (a11y, tipos de botón, memoización de contexto).

### Pendiente (solo el cliente puede resolverlo)

Ver `docs/PARA-EL-CLIENTE.md` para el detalle completo. En resumen: razón social exacta
y términos de cancelación a confirmar; usuario real de Instagram/Facebook si existen.
