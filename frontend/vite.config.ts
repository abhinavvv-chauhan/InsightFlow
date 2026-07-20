import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('echarts') || id.includes('zrender')) return 'echarts'
            if (id.includes('framer-motion') || id.includes('lenis')) return 'motion'
            return 'vendor'
          }
        },
      },
    },
  },
})
