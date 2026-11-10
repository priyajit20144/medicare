import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function createApiProxyConfig(target: string) {
  return {
    target,
    changeOrigin: true,
    configure: (proxy: any) => {
      proxy.on('error', (_err: any, _req: any, res: any) => {
        if (res && typeof res.writeHead === 'function' && !res.headersSent) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              success: false,
              message: 'Backend service is starting up, please retry shortly.',
            })
          );
        }
      });
    },
  };
}

export default defineConfig({
  envDir: path.resolve(__dirname, '..'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('@tanstack') || id.includes('zustand') || id.includes('zod')) {
              return 'vendor-state';
            }
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': createApiProxyConfig('http://localhost:5000'),
      '/uploads': createApiProxyConfig('http://localhost:5000'),
    },
  },
});
