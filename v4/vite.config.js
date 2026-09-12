import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3044 },
  build: {
    // The 3D corridor is lazy-loaded, so three/fiber/drei land in their
    // own chunk. Splitting react out too means a change to the scene
    // does not invalidate the framework cache, and vice versa.
    rollupOptions: {
      output: {
        manualChunks: {
          react:  ['react', 'react-dom'],
          three:  ['three', '@react-three/fiber', '@react-three/drei'],
          motion: ['framer-motion'],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
})
