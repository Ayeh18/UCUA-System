import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    allowedHosts: [
      '898b-180-75-238-4.ngrok-free.app' // <-- Add your ngrok domain here
    ]
  }
})
