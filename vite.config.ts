import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the demo from /<repo>/; local dev stays at /.
  base: process.env.PAGES_BASE ?? '/',
})
