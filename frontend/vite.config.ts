import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // In development the API is proxied, so the browser talks to one origin and CORS never applies.
  const apiTarget = env.VITE_PROXY_TARGET || 'http://localhost:8001';
  const allowedHosts = env.VITE_ALLOWED_HOSTS?.split(',')
    .map((host) => host.trim())
    .filter(Boolean);

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      // e.g. VITE_ALLOWED_HOSTS=my-tunnel.ngrok-free.app when sharing the dev server
      allowedHosts,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
        '/uploads': { target: apiTarget, changeOrigin: true },
      },
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
    },
  };
});
