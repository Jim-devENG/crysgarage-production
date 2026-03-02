import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/master-matchering': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
        secure: false,
      },
      '/upload-file': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
        secure: false,
      },
      '/proxy-download': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
        secure: false,
      },
      '/download': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
        secure: false,
      },
      '/tiers': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
        secure: false,
      },
      '/genres': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 3
      },
      mangle: {
        toplevel: true,
        properties: {
          regex: /^_/
        }
      },
      format: {
        comments: false
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          audio: ['tone', 'standardized-audio-context'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
})
