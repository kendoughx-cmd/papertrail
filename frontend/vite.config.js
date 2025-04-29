import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // server: {
  //   host: '0.0.0.0', // Bind to all interfaces (for example, if you want to access from another device in the same network)
  //   port: 3000, // You can specify the port you want to run on
  // },
})
