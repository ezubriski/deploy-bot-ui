import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "react-oidc-context";
import { BrowserRouter } from "react-router";

import { oidcConfig } from "./auth/oidcConfig";
import { App } from "./App";

import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root not found in index.html");

createRoot(rootEl).render(
  <StrictMode>
    <AuthProvider {...oidcConfig}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
