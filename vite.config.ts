import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Repo <usuario>.github.io: el sitio se sirve desde la raíz del dominio.
  base: '/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('/node_modules/gsap/') || id.includes('/node_modules/@gsap/')) return 'gsap'
          if (id.includes('/node_modules/animejs/')) return 'anime'
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/scheduler/')) return 'react'
          return undefined
        },
      },
    },
  },
})
