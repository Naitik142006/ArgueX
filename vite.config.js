import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy Socket.IO connections to the backend server
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,          // Enable WebSocket proxying
        changeOrigin: true,
      },
      // Proxy API requests to the backend server
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
