import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.ico', 'robots.txt'],
    //   workbox: {
    //     cleanupOutdatedCaches: true,
    //   },
    //   srcDir: 'src',
    //   filename: 'sandbox/service-worker.mjs',
    //   strategies: 'injectManifest',
    //   devOptions: {
    //     enabled: true,
    //   },
    // }),
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      // 'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  resolve: {
    alias: {
      fs: 'memfs',
      path: 'path-browserify',
      process: 'process/browser',
      buffer: 'buffer/',
    },
  },
  define: {
    // Required for some Node shims
    global: 'globalThis',
  },
});
