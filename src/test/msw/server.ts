import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Node-side MSW for vitest. Browser-side mocking is wired separately in
// src/main.tsx behind VITE_DEV_MOCKS so the same handler set drives both.
export const server = setupServer(...handlers);
