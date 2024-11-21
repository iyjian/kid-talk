import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

const env = loadEnv("development", process.cwd());

// https://vitejs.dev/config/
export default defineConfig({
  base: '/admin-panel',
  plugins: [
    vue(),
    // visualizer({
    //   gzipSize: true,
    //   brotliSize: true,
    //   emitFile: false,
    //   filename: "test.html",
    //   open: true
    // }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      "/api/auth": {
        // target: 'http://localhost:50004/',
        target: env.VITE_APP_AUTH_API,
        rewrite: (path) => path.replace(/^\/api/, ""),
        changeOrigin: true,
      },      
      '/api': {
        target: 'http://localhost:3000/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ws': {
        target: 'http://localhost:3000',
        // changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/ws/, ''),
        ws: true,
      },
    }
  }
})
