import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "react-oidc-context";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { oidcConfig } from "./auth/oidcConfig";
import { DevAuthProvider } from "./auth/devAuth";
import { DEV_MOCKS } from "./auth/mode";
import { App } from "./App";

import "./index.css";

// One QueryClient at module scope so cache survives unmounts of <App />.
// Defaults: 30s stale time so navigating between pages doesn't refetch
// constantly; refetch on window focus so a returning tab catches new
// pending deploys without a manual reload.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

async function bootstrap() {
  // Gate on import.meta.env.DEV in addition to DEV_MOCKS so MSW is
  // statically dead code in production builds — the chunk gets
  // generated but never imported, and a hostile prod env var can't
  // re-enable it.
  if (import.meta.env.DEV && DEV_MOCKS) {
    const { worker } = await import("./test/msw/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }

  const rootEl = document.getElementById("root");
  if (!rootEl) throw new Error("#root not found in index.html");

  // Both auth providers are always mounted so hooks have a stable
  // context regardless of mode. useAuthState picks the active one based
  // on VITE_DEV_AUTH; the inactive provider acts as a no-op.
  createRoot(rootEl).render(
    <StrictMode>
      <AuthProvider {...oidcConfig}>
        <DevAuthProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </QueryClientProvider>
        </DevAuthProvider>
      </AuthProvider>
    </StrictMode>,
  );
}

void bootstrap();
