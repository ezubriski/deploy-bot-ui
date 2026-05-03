import { defineConfig, devices } from "@playwright/test";

// Single browser (chromium) is enough for a SPA that renders the same in
// any modern engine; cross-browser matters for novel CSS, not for the
// table-and-form surfaces here. The webServer block boots vite in dev-auth
// + mock mode so the e2e walks a deterministic backend.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "list" : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- --port 5173",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      VITE_DEV_AUTH: "true",
      VITE_DEV_MOCKS: "true",
    },
  },
});
