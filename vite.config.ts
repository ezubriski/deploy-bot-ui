import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Dev server proxies /v1/* to a locally-running bin/api so we don't fight
// CORS in development. In production the same path-prefix split is done
// by the nginx pod that serves the built SPA — the SPA's API client only
// ever calls relative URLs ("/v1/..."), so the only thing that changes
// between dev and prod is what's behind that prefix.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/v1": {
        target: process.env.VITE_API_PROXY ?? "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
