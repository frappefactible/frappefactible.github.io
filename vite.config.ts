import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Repo <usuario>.github.io: el sitio se sirve desde la raíz del dominio.
  base: '/',
  plugins: [react(), tailwindcss()],
})
