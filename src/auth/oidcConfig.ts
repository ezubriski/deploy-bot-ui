import type { AuthProviderProps } from "react-oidc-context";
import { WebStorageStateStore } from "oidc-client-ts";

import { DEV_AUTH } from "./mode";

// OIDC settings live in env vars (Vite injects VITE_*-prefixed values at
// build time). For local dev they come from .env.local; for production
// they're baked into the static bundle by the build job. The audience
// is always the UI's own client_id — Keycloak puts that in the `aud`
// claim of issued ID tokens by default, which is exactly what the API
// verifier checks.
//
// In dev-auth mode (VITE_DEV_AUTH=true) the OIDC vars are optional —
// useAuthState short-circuits to the dev provider and the OIDC provider
// is never asked to redirect anywhere — but we still need a syntactically
// valid AuthProviderProps so AuthProvider can mount as a passthrough.

const issuer = import.meta.env.VITE_OIDC_ISSUER;
const clientId = import.meta.env.VITE_OIDC_CLIENT_ID ?? "deploy-bot-ui";

if (!issuer && !DEV_AUTH) {
  throw new Error(
    "VITE_OIDC_ISSUER must be set at build time (or in .env.local for dev). " +
      "Set VITE_DEV_AUTH=true to skip OIDC and use the API's admin account.",
  );
}

export const oidcConfig: AuthProviderProps = {
  // Placeholder issuer in dev-auth mode — AuthProvider stays mounted so
  // useAuth() has a context, but signin is never invoked.
  authority: issuer ?? "https://oidc-disabled.invalid/",
  client_id: clientId,
  redirect_uri: `${window.location.origin}/callback`,
  post_logout_redirect_uri: window.location.origin,
  response_type: "code",
  scope: "openid profile email",
  // Tokens live in sessionStorage so they don't survive a tab close.
  // localStorage would persist across sessions but is more exposed to
  // XSS exfiltration; sessionStorage strikes the right balance for a
  // tool engineers use during a workday.
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  // Skip the discovery doc round-trip in dev-auth mode — we never sign
  // in via OIDC, so fetching .well-known would be a wasted (and noisy)
  // network error.
  skipSigninCallback: DEV_AUTH,
  // Strip the auth code/state from the URL once the lib has consumed
  // them, so a refresh after callback doesn't re-trigger the exchange.
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};
