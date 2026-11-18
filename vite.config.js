import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('react')) return 'vendor';
          }
        },
      },
    },
  },
})
