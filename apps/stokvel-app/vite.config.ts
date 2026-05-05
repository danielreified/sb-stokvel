import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig((_env) => ({
  plugins: [
    // Router plugin must come before React plugin
    TanStackRouterVite({
      routesDirectory: 'src/routes',
      generatedRouteTree: 'src/routeTree.gen.ts',
    }),
    react(),
    // HTTPS=true enables mkcert (needed for real-device LAN testing); localhost works without it
    ...(process.env.HTTPS === 'true' ? [mkcert()] : []),
    VitePWA({
      registerType: 'prompt',
      // skipWaiting + clientsClaim both false — banking context, no surprise reloads
      injectRegister: 'inline',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      workbox: {
        // Precache the app shell only. JSON API responses are handled by React Query + IndexedDB.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [],
      },
      manifest: {
        name: 'Seyva Stokvel',
        short_name: 'Seyva',
        description: 'Manage your stokvel savings group with Seyva — powered by Standard Bank.',
        id: '/?source=pwa',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0033A0',
        background_color: '#0033A0',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Make Contribution',
            short_name: 'Contribute',
            url: '/contributions/new',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'View Members',
            short_name: 'Members',
            url: '/members',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
        ],
      },
    }),
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.1.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-query-persist-client'],
          'router-vendor': ['@tanstack/react-router'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
}));
