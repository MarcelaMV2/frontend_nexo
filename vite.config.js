import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      'selected-kelkoo-resolutions-institutional.trycloudflare.com', // 👈 tu dominio del túnel frontend
    ],
  },
})