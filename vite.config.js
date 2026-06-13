import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'najahi_logo.png'],
      manifest: {
        name: 'Najahi - Plateforme Scolaire Marocaine',
        short_name: 'Najahi',
        description: "Guide des écoles, test d'orientation et study rooms pour les étudiants marocains",
        theme_color: '#7c3aed',
        background_color: '#0f0a1e',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/najahi_logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/najahi_logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/najahi_logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // API: network-first with 5-min cache fallback for offline
            urlPattern: /\/api\/(profile|schools|concours|study\/stats|study\/leaderboard)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'najahi-api-data',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 60, maxAgeSeconds: 3600 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // All other API calls: network-only (don't cache mutations)
            urlPattern: /\/api\//,
            handler: 'NetworkOnly',
          },
          {
            // Google Fonts
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      }
    })
  ],
  // proxy only active during `vite dev`, ignored in production builds
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
