import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 3001,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      // Configurações para produção
      chunkSizeWarningLimit: 1000, // Aumentar limite de aviso para 1MB
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Separar node_modules por biblioteca
            if (id.includes('node_modules')) {
              // React core
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor';
              }
              // React Router
              if (id.includes('react-router-dom')) {
                return 'router';
              }
              // React Query
              if (id.includes('@tanstack/react-query')) {
                return 'query';
              }
              // React PDF - chunk separado para componente de PDF
              if (id.includes('@react-pdf/renderer')) {
                return 'pdf';
              }
              // Outras bibliotecas grandes em chunk separado
              if (id.includes('node_modules')) {
                return 'libs';
              }
            }
          }
        }
      }
    }
  }
})