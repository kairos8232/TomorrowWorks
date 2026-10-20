import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // Replit serves the development app through a proxy.
    allowedHosts: true,
    // In development, send API calls to the Node server (npm run serve).
    proxy: { '/api': 'http://127.0.0.1:5000' },
  },
});
