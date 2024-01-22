import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import proxyOptions from './proxyOptions';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  server: {
    port: 8080,
    proxy: proxyOptions,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../hazelnode/public/frontend',
    emptyOutDir: true,
    target: 'es2015',
  },
});
