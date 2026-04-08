import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'src/renderer'),
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/renderer/index.html'),
        note: path.resolve(__dirname, 'src/renderer/note.html'),
      },
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    // Ensure CSS is extracted as a separate file, not inlined
    cssCodeSplit: false,
  },
  server: {
    port: 5173,
  },
});
