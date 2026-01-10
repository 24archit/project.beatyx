import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Include your actual favicon/assets here so they work offline
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'], 
      manifest: {
        name: 'Beatyx Music',
        short_name: 'Beatyx',
        description: 'Stream your favorite music seamlessly.',
        start_url: '/',
        display: 'standalone', // <--- REMOVES BROWSER UI (URL BAR)
        orientation: 'portrait',
        
        // "Theme Color" sets the color of the window title bar (mobile/desktop)
        // Note: It must be a solid hex, gradients are not supported by the OS here.
        theme_color: '#130242', 
        
        // "Background Color" sets the splash screen color while loading
        background_color: '#130242',

        icons: [
          {
            src: 'icon-192x192.png', // Ensure file exists in /public
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable' // "maskable" looks better on Android/rounded icons
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        
        // Taskbar shortcuts (Right-click menu on app icon)
        shortcuts: [
          {
            name: "Open Player",
            short_name: "Player",
            description: "Go to the music player",
            url: "/player",
            icons: [{ src: "pwa-192x192.png", sizes: "192x192" }]
          }
        ],
        
        categories: ["music", "entertainment", "multimedia"]
      }
    })
  ],
  esbuild: {
    drop: ['console', 'debugger'],
  },
})