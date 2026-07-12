import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Port for each of the three portal instances is supplied on the CLI via
// `--port` in the dev:admin / dev:internal / dev:external npm scripts
// (cross-platform, no shell-specific env-var syntax needed). VITE_PORTAL
// itself comes from the matching .env.<mode> file selected by `--mode`.
// The /api proxy is identical and shared across all three instances.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000"
    }
  }
});
