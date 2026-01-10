import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // Import this

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Beatyx Music',
        short_name: 'Beatyx',
        description: 'Your go-to music streaming platform',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png', // Ensure you add these icons to your public folder
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  esbuild: {
    drop: ['console', 'debugger'],
  },
})