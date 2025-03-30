import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import axios from 'axios';
import axiosRetry from 'axios-retry';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '/src/utils/dashboardPresets.ts': '/src/utils/dashboardPresets.tsx'
    },
  },
  server: {
    host: true,
    hmr: {
      clientPort: undefined,
      port: undefined,
      host: undefined
    },
    proxy: {
      '/api/coingecko': {
        target: 'https://pro-api.coingecko.com/api/v3',
        changeOrigin: true,
        secure: true,
        timeout: 120000,
        proxyTimeout: 120000,
        rewrite: (path) => path.replace(/^\/api\/coingecko/, ''),
        configure: (proxy, options) => {
          const axiosInstance = axios.create({
            timeout: 120000,
            headers: {
              'Connection': 'keep-alive',
              'Keep-Alive': 'timeout=120'
            }
          });

          axiosRetry(axiosInstance, { 
            retries: 5,
            retryDelay: (retryCount) => {
              return axiosRetry.exponentialDelay(retryCount) + Math.random() * 1000;
            },
            retryCondition: (error) => {
              return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
                     error.code === 'ECONNRESET' ||
                     error.code === 'ETIMEDOUT' ||
                     error.code === 'ECONNABORTED' ||
                     error.response?.status === 429 ||
                     error.response?.status === 500 ||
                     error.response?.status === 502 ||
                     error.response?.status === 503 ||
                     error.response?.status === 504;
            }
          });

          proxy.on('proxyReq', (proxyReq, req, res) => {
            const apiKey = process.env.VITE_COINGECKO_API_KEY || 'CG-gTgiBRydF4PqMfgYZ4Wr6fxB';
            proxyReq.setHeader('x-cg-pro-api-key', apiKey);
            proxyReq.setHeader('Connection', 'keep-alive');
            proxyReq.setHeader('Keep-Alive', 'timeout=120');
          });

          proxy.on('proxyRes', (proxyRes, req, res) => {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
          });

          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
            if (!res.headersSent) {
              const errorText = err.response?.text || err.message;
              res.writeHead(500, {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              });
              res.end(JSON.stringify({ 
                error: 'Proxy error occurred',
                message: errorText,
                code: err.code || 'UNKNOWN_ERROR'
              }));
            }
          });
        }
      },
      '/api/twitter': {
        target: 'https://twitter154.p.rapidapi.com',
        changeOrigin: true,
        secure: true,
        timeout: 30000,
        proxyTimeout: 30000,
        rewrite: (path) => {
          const pathMap: Record<string, string> = {
            '/api/twitter/search/search': '/search/search',
            '/api/twitter/trends': '/trends',
            '/api/twitter/listtimeline': '/listtimeline'
          };
          
          for (const [key, value] of Object.entries(pathMap)) {
            if (path.startsWith(key)) {
              return value;
            }
          }
          return path;
        },
        headers: {
          'x-rapidapi-host': 'twitter154.p.rapidapi.com',
          'x-rapidapi-key': '56da9e331emshb1150f72dcd5029p12a375jsnb16e7026a17a',
          'Connection': 'keep-alive',
          'Keep-Alive': 'timeout=30'
        },
        configure: (proxy, options) => {
          const axiosInstance = axios.create({
            timeout: 30000,
            headers: {
              'Connection': 'keep-alive',
              'Keep-Alive': 'timeout=30'
            }
          });

          axiosRetry(axiosInstance, { 
            retries: 3,
            retryDelay: axiosRetry.exponentialDelay,
            retryCondition: (error) => {
              return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
                     error.response?.status === 429 || 
                     error.response?.status >= 500;
            }
          });

          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('x-rapidapi-host', 'twitter154.p.rapidapi.com');
            proxyReq.setHeader('x-rapidapi-key', '56da9e331emshb1150f72dcd5029p12a375jsnb16e7026a17a');
            proxyReq.setHeader('Connection', 'keep-alive');
            proxyReq.setHeader('Keep-Alive', 'timeout=30');
          });

          proxy.on('proxyRes', (proxyRes, req, res) => {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
          });

          proxy.on('error', (err, req, res) => {
            console.error('Twitter API proxy error:', err);
            if (!res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
              });
              res.end(JSON.stringify({
                error: 'Twitter API error',
                message: err.message
              }));
            }
          });
        }
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-hover-card', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          'chart-vendor': ['chart.js', 'react-chartjs-2', 'recharts'],
          'grid-vendor': ['react-grid-layout', 'gridstack']
        }
      }
    },
    sourcemap: true,
    target: 'esnext',
    minify: 'esbuild'
  },
  preview: {
    port: 5173,
    strictPort: true,
    host: true,
  }
});