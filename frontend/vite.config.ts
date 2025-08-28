import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000", // Backend server
        changeOrigin: true, // Ensure the request appears to come from the frontend server
        // rewrite: (path) => path.replace(/^\/api/, ""), // Optional: Remove '/api' prefix
      },
    },
  },
});
