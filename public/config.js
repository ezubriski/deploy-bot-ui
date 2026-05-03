// Dev-time stub for runtime config. In the container this file is shadowed
// by /tmp/config.js, which the entrypoint generates from OIDC_ISSUER /
// OIDC_CLIENT_ID env vars. Here we leave the object empty so runtimeConfig.ts
// falls through to import.meta.env.VITE_* for `npm run dev`.
window.__RUNTIME_CONFIG__ = window.__RUNTIME_CONFIG__ || {};
