import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        sw: './src/sw.ts',
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
  server: {
    headers: {
      // 'Cross-Origin-Opener-Policy': 'same-origin',
      // 'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
