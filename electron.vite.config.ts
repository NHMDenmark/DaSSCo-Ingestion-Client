import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    resolve: {
      alias: {
        "@/lib": resolve('src/main/lib'),
        "@shared": resolve('src/shared')
      }
    }
  },
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@/components': resolve('src/renderer/src/components'),
        "@shared": resolve('src/shared')
      }
    },
    plugins: [react()]
  }
})
