import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { writeFileSync, mkdirSync, existsSync, rmSync, copyFileSync } from 'fs';

// Plugin to create proper HTML files after build
function fixExtensionHtml() {
  return {
    name: 'fix-extension-html',
    closeBundle() {
      // Remove the incorrectly placed src folder
      if (existsSync('dist/src')) {
        rmSync('dist/src', { recursive: true });
      }

      // Ensure directories exist
      ['dist/sidepanel', 'dist/options'].forEach(dir => {
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
      });

      // Create sidepanel HTML with correct relative paths
      const sidepanelHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prompt Auditor</title>
  <link rel="stylesheet" href="../assets/sidepanel.css">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./sidepanel.js"></script>
</body>
</html>`;
      writeFileSync('dist/sidepanel/index.html', sidepanelHtml);

      // Create options HTML with correct relative paths
      const optionsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prompt Auditor Settings</title>
  <link rel="stylesheet" href="../assets/options.css">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./options.js"></script>
</body>
</html>`;
      writeFileSync('dist/options/index.html', optionsHtml);

      // Copy content script CSS
      if (!existsSync('dist/content')) {
        mkdirSync('dist/content', { recursive: true });
      }
      if (existsSync('src/content/content.css')) {
        copyFileSync('src/content/content.css', 'dist/content/content.css');
      }
    },
  };
}

// Main config for sidepanel, options, and background
export default defineConfig({
  plugins: [react(), fixExtensionHtml()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'src/sidepanel/index.html'),
        options: resolve(__dirname, 'src/options/index.html'),
        background: resolve(__dirname, 'src/background/service-worker.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background/service-worker.js';
          }
          return '[name]/[name].js';
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          if (name.endsWith('.css')) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name][extname]';
        },
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('lib/storage') || id.includes('lib/api')) {
            return 'shared';
          }
          return undefined;
        },
      },
    },
  },
  publicDir: 'public',
});
