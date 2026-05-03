import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// jsdom for component tests; setupFiles installs jest-dom matchers and the
// MSW server so any test importing a hook gets the same fixtures the dev
// mock server uses, keeping unit and dev environments in sync.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    exclude: ["node_modules", "dist", "e2e"],
  },
});
