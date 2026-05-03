import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// Browser worker — only loaded when VITE_DEV_MOCKS=true. Lets the UI run
// against deterministic fixtures without standing up the api binary.
export const worker = setupWorker(...handlers);
