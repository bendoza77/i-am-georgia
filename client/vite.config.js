import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Stamp each build so we can confirm in the browser which deploy is live.
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
})
