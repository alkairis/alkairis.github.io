import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  // Base public path. Defaults to "/" which is correct for a custom domain
  // (e.g. alkairis.com) or a user/org GitHub Pages site. If you ever deploy to
  // a project page instead (https://<user>.github.io/<repo>/), set VITE_BASE to
  // "/<repo>/" at build time — nothing about the domain is hardcoded here.
  base: process.env.VITE_BASE ?? "/",
  plugins: [react(), tailwindcss()],
  // Proxy backend calls through the dev origin so the browser doesn't fire
  // cross-origin requests at localhost:8080 — that pattern trips Chrome's
  // "Local Network Access" permission prompt on startup.
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
      "/blog": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
});
