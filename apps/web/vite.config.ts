import path from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    // Vite 6 bloquea (403) requests cuyo Host no esté permitido. Detrás de
    // nginx, algunas locations reenvían `Host: vite_upstream` (nombre del
    // upstream). Permitimos ese host + localhost. Solo dev local tras proxy.
    allowedHosts: ['localhost', 'vite_upstream', 'node-dev'],
    hmr: {
      // Cliente vive detrás de nginx (puerto 8080); le decimos a Vite
      // que abra el WS hacia ese puerto, no al 5173 interno.
      clientPort: 8080,
    },
    watch: {
      // Bind mount Windows + Linux container: polling para detectar cambios.
      usePolling: true,
      interval: 300,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
