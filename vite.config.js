import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Actualiza el Service Worker automáticamente
      manifest: {
        name: 'Drink Tracker',
        short_name: 'Tracker',
        description: 'Controla tu consumo con cabeza',
        theme_color: '#ffffff', // Color de la barra de estado del móvil
        background_color: '#ffffff',
        display: 'standalone', // Oculta la barra del navegador (apariencia nativa)
        icons: [
          // Necesitaremos añadir iconos reales más adelante en la carpeta /public
          {
            src: 'pwa-192x192.png',
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
  ]
})