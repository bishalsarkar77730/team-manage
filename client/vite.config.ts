import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    cors: true,
    // The backend only sends `Access-Control-Allow-Origin: <FRONTEND_ORIGIN>`,
    // and session cookies are rejected by the browser when that does not match
    // the page's origin exactly. Keep this in sync with FRONTEND_ORIGIN in
    // backend/.env. strictPort makes a busy port fail loudly instead of
    // silently moving to another one and breaking auth again.
    port: 3000,
    strictPort: true,
  },
});