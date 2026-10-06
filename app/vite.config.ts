import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Librerie che non cambiano quasi mai: tenerle a parte significa che
          // un aggiornamento dell'app non costringe a riscaricarle.
          vendor: ['react', 'react-dom', 'react-router-dom'],
          dati: ['dexie', 'dexie-react-hooks', '@supabase/supabase-js'],
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icona-192.png', 'icona-512.png'],
      manifest: {
        name: 'Gestione Assistenza',
        short_name: 'Assistenza',
        description: 'Verifiche RT, scadenze contratti e interventi tecnici',
        lang: 'it',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        icons: [
          { src: 'icona-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icona-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icona-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        // Le chiamate a Supabase non vanno mai in cache: i dati stanno in
        // IndexedDB e la rete serve solo per sincronizzare.
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [],
      },
    }),
  ],
})
