import type { AuthProviderProps } from "react-oidc-context";
import { WebStorageStateStore } from "oidc-client-ts";

// OIDC settings live in env vars (Vite injects VITE_*-prefixed values at
// build time). For local dev they come from .env.local; for production
// they're baked into the static bundle by the build job. The audience
// is always the UI's own client_id — Keycloak puts that in the `aud`
// claim of issued ID tokens by default, which is exactly what the API
// verifier checks.

const issuer = import.meta.env.VITE_OIDC_ISSUER;
const clientId = import.meta.env.VITE_OIDC_CLIENT_ID ?? "deploy-bot-ui";

if (!issuer) {
  throw new Error(
    "VITE_OIDC_ISSUER must be set at build time (or in .env.local for dev)",
  );
}

export const oidcConfig: AuthProviderProps = {
  authority: issuer,
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
  // Strip the auth code/state from the URL once the lib has consumed
  // them, so a refresh after callback doesn't re-trigger the exchange.
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};
