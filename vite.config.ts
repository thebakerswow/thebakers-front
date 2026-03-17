import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          // Split each dependency into its own chunk for better cacheability
          // and to avoid oversized app chunks.
          const pkgPath = id.split('node_modules/')[1]
          const pkgName = pkgPath?.startsWith('@')
            ? pkgPath.split('/').slice(0, 2).join('/')
            : pkgPath?.split('/')[0]

          return pkgName ? `vendor-${pkgName.replace('/', '-')}` : 'vendor'
        },
      },
    },
  },
})
