import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:4001', // Changed from VPS to Local
      changeOrigin: true,
      secure: false,
    },
    '/assets': {
      target: 'http://localhost:4001', // Changed from VPS to Local
      changeOrigin: true,
      secure: false,
    }
  }
},
  // server: {
  //   port: 5173,
  //   proxy: {
  //     // Proxy for Data (Login, Slider info, etc.)
  //     '/api': {
  //       target: 'https://poteayurvedapi.bizonance.in',
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //     // Proxy for Images (Your backend serves these from /assets)
  //     '/assets': {
  //       target: 'https://poteayurvedapi.bizonance.in',
  //       changeOrigin: true,
  //       secure: false,
  //     }
  //   }
  // },
})