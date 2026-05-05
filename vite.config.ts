import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    host: true,
  },
  build: {
    outDir: 'dist/client',
    ssrManifest: true,
    rollupOptions: {
      input: 'src/client/entry-client.tsx'
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
