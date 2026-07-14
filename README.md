# Touamamari — Tours en Rapa Nui 🗿

Sitio oficial de **Touamamari** (Servicios Turísticos Touamamari SpA): tours
arqueológicos y experiencias culturales en Isla de Pascua (Rapa Nui), Chile.

**Producción:** https://www.touamamari.cl

## Qué hace

- Catálogo bilingüe (ES/EN) de tours cargado desde Supabase, con filtros y detalle.
- Reserva con calendario de disponibilidad real (cupos por fecha) y carrito.
- El cierre de la venta es por WhatsApp: los valores se cotizan según el grupo.
- Avisos automáticos por correo al negocio en cada reserva y mensaje de contacto,
  y confirmación por correo al viajero (Resend, desde `noreply@touamamari.cl`).
- Galería fotográfica, guía de viaje, impacto social y términos.
- Instalable como app (PWA) en iPhone/Android.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS v4, Framer Motion |
| Backend | Funciones serverless de Vercel (`api/`) + Express (`server.ts`) para desarrollo |
| Base de datos | Supabase (PostgreSQL con RLS) |
| Correo | Resend (dominio touamamari.cl verificado) |
| Hosting | Vercel — cada push a `main` despliega a producción |

## Estructura

```
├── api/                   # Funciones serverless (producción)
│   ├── _lib/store.ts      #   Acceso a Supabase (service role) + notificaciones
│   ├── contact.ts         #   POST /api/contact — formulario de contacto
│   ├── bookings/create.ts #   POST /api/bookings/create — registrar reserva
│   ├── bookings/confirm.ts#   POST /api/bookings/confirm — correo al viajero
│   └── health.ts          #   GET  /api/health
├── src/
│   ├── pages/             # Home, Gallery, TravelGuide, SocialImpact, Terms
│   ├── components/        # Layout, Cart, TourCard...
│   ├── context/           # CartContext (carrito), i18n (ES/EN)
│   ├── lib/               # api.ts (queries a Supabase), whatsapp.ts
│   ├── data/              # Datos estáticos y de respaldo
│   └── types/             # Tipos compartidos
├── public/                # Imágenes (WebP), videos, PWA, favicon
├── supabase/migrations/   # SQL de la base de datos
├── scripts/               # Utilidades de optimización de imágenes
├── docs/                  # Documentación para el cliente
├── server.ts              # Servidor de desarrollo (Express + Vite middleware)
└── index.html             # Entrada + SEO (canonical, Open Graph, JSON-LD)
```

## Desarrollo

```bash
npm install
cp .env.example .env.local   # completar las claves
npm run dev                  # http://localhost:3000
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (Express + Vite) |
| `npm run build` | Build de producción (`dist/`) |
| `npm run lint` | Chequeo de tipos (`tsc --noEmit`) |

### Variables de entorno

Ver [.env.example](.env.example). Las `VITE_*` llegan al navegador (se hornean
en el build); las demás son solo del backend. En Vercel ya están configuradas.

> **Nota:** los INSERT públicos están bloqueados por RLS a propósito. El
> navegador nunca escribe directo en Supabase: llama a `/api/*` y el backend
> escribe con la service role key.

## Deploy

Push a `main` → Vercel construye y publica automáticamente en
https://www.touamamari.cl (con `touamamari.vercel.app` como alias).
