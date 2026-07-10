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
          icons: [
            {src: '/icon-192.png', sizes: '192x192', type: 'image/png'},
            {src: '/icon-512.png', sizes: '512x512', type: 'image/png'},
            {
              src: '/icon-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // Solo el esqueleto de la app va al precache. Fotos y videos suman
          // más de 12 MB: precargarlos dispararía la instalación del SW y el
          // consumo de datos del visitante sin que llegue a verlos todos.
          globPatterns: ['**/*.{js,css,html,svg,woff2}'],
          navigateFallback: '/index.html',
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: ({request}) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'imagenes',
                expiration: {maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30},
                cacheableResponse: {statuses: [0, 200]},
              },
            },
            {
              // Los videos se piden por rangos (206). Cachearlos rompe el seek,
              // así que se dejan pasar directo a la red.
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
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
