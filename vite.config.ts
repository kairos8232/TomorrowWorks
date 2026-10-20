import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // Replit serves the development app through a proxy.
    allowedHosts: true,
  },
});
