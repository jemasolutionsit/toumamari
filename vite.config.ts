import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png'],
        manifest: {
          name: 'Toumamari — Tours en Rapa Nui',
          short_name: 'Toumamari',
          description:
            'Tours arqueológicos y experiencias culturales en Rapa Nui (Isla de Pascua).',
          lang: 'es',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#0a0a0a',
          theme_color: '#0a0a0a',
          categories: ['travel', 'tourism'],
          prefer_related_applications: false,
          icons: [
            {src: '/icon-192.png', sizes: '192x192', type: 'image/png'},
            {src: '/icon-512.png', sizes: '512x512', type: 'image/png'},
            {
              src: '/icon-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            // Apple touch icon — también referenciado en index.html para iOS
            {src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png'},
          ],
        },
        workbox: {
          // Solo shell de la app va al precache. Fotos y videos suman
          // más de 10 MB: precargarlos sería muy costoso en móvil.
          globPatterns: ['**/*.{js,css,html,svg,woff2}'],
          navigateFallback: '/index.html',
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: ({request}) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'imagenes',
                expiration: {maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30},
                cacheableResponse: {statuses: [0, 200]},
              },
            },
            {
              // Los videos se piden por rangos (206). Cachearlos rompe el seek.
              urlPattern: ({request}) => request.destination === 'video',
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /^https:\/\/[a-z0-9]+\.supabase\.co\/rest\/v1\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-supabase',
                networkTimeoutSeconds: 5,
                expiration: {maxEntries: 30, maxAgeSeconds: 60 * 60 * 24},
                cacheableResponse: {statuses: [0, 200]},
              },
            },
            {
              // Tipo de cambio USD/CLP — cachear 1 hora
              urlPattern: /^https:\/\/mindicador\.cl\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'exchange-rate',
                expiration: {maxEntries: 5, maxAgeSeconds: 60 * 60},
                cacheableResponse: {statuses: [0, 200]},
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Apuntar a browsers modernos — menos transformaciones, bundle más pequeño
      target: ['es2020', 'chrome89', 'safari14'],
      rollupOptions: {
        output: {
          manualChunks(id) {
            // React + router → chunk propio, muy estable entre deploys (cache larga)
            if (
              id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router')
            ) {
              return 'react-vendor';
            }
            // Librería de animaciones
            if (
              id.includes('node_modules/motion') ||
              id.includes('node_modules/framer-motion')
            ) {
              return 'motion';
            }
            // Iconos
            if (id.includes('node_modules/lucide-react')) {
              return 'ui-icons';
            }
            // Supabase JS (pesado, pero solo se usa en llamadas API)
            if (id.includes('node_modules/@supabase')) {
              return 'supabase';
            }
          },
        },
      },
    },
    server: {
      // HMR desactivado en AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
