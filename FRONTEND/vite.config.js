import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "localhost"
      },
      "/oauth2": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "localhost"
      },
      "/logout": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "localhost"
      }
    },
  },
});
