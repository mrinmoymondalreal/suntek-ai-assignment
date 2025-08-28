import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const API_BASE = env.VITE_API_BASE ?? "http://localhost:3000";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: API_BASE, // Backend server
          changeOrigin: true, // Ensure the request appears to come from the frontend server
          // rewrite: (path) => path.replace(/^\/api/, ""), // Optional: Remove '/api' prefix
        },
      },
    },
  };
});
