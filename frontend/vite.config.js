import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    outDir: '../backend/pb_public',
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0', // Allow LAN access
    port: 5173,
    open: true,
  },
})
