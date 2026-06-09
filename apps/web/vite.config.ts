import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
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
