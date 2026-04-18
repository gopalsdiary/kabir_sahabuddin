import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    '__BUNDLED_DEV__': true,
    '__SERVER_FORWARD_CONSOLE__': false,
  }
})
