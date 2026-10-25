import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // Base public path. Defaults to "/" which is correct for a custom domain
  // (e.g. alkairis.com) or a user/org GitHub Pages site. If you ever deploy to
  // a project page instead (https://<user>.github.io/<repo>/), set VITE_BASE to
  // "/<repo>/" at build time — nothing about the domain is hardcoded here.
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  // Third-party code changes far less often than the site, so it ships in its
  // own long-cached chunks (and keeps the app chunk under the 500 kB warning).
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "react", test: /node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/, priority: 2 },
            { name: "vendor", test: /node_modules[\\/]/, priority: 1 },
          ],
        },
      },
    },
  },
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
