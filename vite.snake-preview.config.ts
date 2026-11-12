import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { launcherVendorChunk } from './scripts/launcher-vendor-chunks';
import { snakePreviewMedia } from './scripts/snake-preview-media';

export default defineConfig({
  root: 'preview/snake',
  base: '/preview/snake/',
  envDir: process.cwd(),
  publicDir: false,
  plugins: [snakePreviewMedia(), react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  build: {
    manifest: true,
    outDir: '../../dist/preview/snake',
    emptyOutDir: true,
    rollupOptions: { output: { manualChunks: launcherVendorChunk } },
  },
});
