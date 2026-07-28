import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const deployBase = '/resume-builder/'

// https://vite.dev/config/
export default defineConfig({
  base: deployBase,
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          editor: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities', 'lucide-react'],
          content: ['marked', 'dompurify', 'qrcode.react', 'lz-string'],
          export: ['html-to-image']
        }
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['canvas-icon.svg'],
      manifest: {
        name: 'Canvas Studio · 移动画布排版',
        short_name: 'Canvas Studio',
        description: '面向移动端画布的图文排版工具',
        theme_color: '#0A0A0A',
        background_color: '#FAF8F4',
        lang: 'zh-CN',
        display: 'standalone',
        scope: deployBase,
        start_url: deployBase,
        icons: [
          {
            src: `${deployBase}icon-192x192.svg`,
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: `${deployBase}icon-512x512.svg`,
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
})
