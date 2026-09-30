import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages: https://nbaenkhbat-create.github.io/cv-qr/
export default defineConfig({
  plugins: [react()],
  base: '/cv-qr/',
})
