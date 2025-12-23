import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

// Separate config for content script - builds as IIFE with no imports
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't clear dist from main build
    lib: {
      entry: resolve(__dirname, 'src/content/content.ts'),
      name: 'PromptAuditorContent',
      formats: ['iife'],
      fileName: () => 'content/content.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  publicDir: false,
  plugins: [
    {
      name: 'copy-content-css',
      closeBundle() {
        if (!existsSync('dist/content')) {
          mkdirSync('dist/content', { recursive: true });
        }
        if (existsSync('src/content/content.css')) {
          copyFileSync('src/content/content.css', 'dist/content/content.css');
        }
      },
    },
  ],
});
