import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icon.png', 'manifest.json'],
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'osm-tiles-cache',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 90 // 90 days
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?|js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-assets-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          {
            urlPattern: ({ url }) =>
              url.pathname.endsWith('.json') ||
              url.hostname.includes('firestore.googleapis.com') ||
              url.hostname.includes('docs.google.com') && url.pathname.includes('/export'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-data-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours for fallback
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'firebase-storage-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Portsmouth Bridge',
        short_name: 'Bridge',
        description: 'Connecting Community • Restoring Hope',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icon.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      devOptions: { enabled: false }
    })
  ],
  resolve: {
    // 強制 Vite 使用單一版本的 Firebase 模組，避免版本衝突
    dedupe: ['firebase', '@firebase/app', '@firebase/auth', '@firebase/firestore']
  },
  optimizeDeps: {
    // 預先打包這些模組，解決 Rollup 解析問題
    include: [
      'firebase/app',
      'firebase/firestore',
      'firebase/auth',
      '@firebase/app',
      '@firebase/firestore',
      '@firebase/auth'
    ]
  },
  build: {
    commonjsOptions: {
      include: [/firebase/, /node_modules/]
    }
  }
})