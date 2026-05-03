// Runtime-injected config. The container entrypoint envsubst's a template
// into /tmp/config.js (served at /config.js by nginx) which sets
// window.__RUNTIME_CONFIG__ before the bundle loads. That keeps the same
// image deployable to any OIDC realm — the bundle is built once, the
// values arrive at pod start.
//
// In `npm run dev` the same path is served from public/config.js as a
// no-op stub, so we fall through to import.meta.env.VITE_* and the
// developer's .env.local still works.

interface RuntimeConfig {
  oidcIssuer?: string;
  oidcClientId?: string;
}

const injected: RuntimeConfig = window.__RUNTIME_CONFIG__ ?? {};

export const oidcIssuer = injected.oidcIssuer || import.meta.env.VITE_OIDC_ISSUER;
export const oidcClientId =
  injected.oidcClientId || import.meta.env.VITE_OIDC_CLIENT_ID || "deploy-bot-ui";
