// Single source of truth for which auth flow is wired up. Read once at
// module load — Vite inlines `import.meta.env.VITE_*` at build time, so
// switching modes requires a rebuild (or a dev-server restart). That's
// fine: choosing OIDC vs. dev-auth is a deployment-time decision, not a
// per-request one.
export const DEV_AUTH = import.meta.env.VITE_DEV_AUTH === "true";

// MSW browser worker is wired separately and is independent of auth mode
// — you can run real OIDC against mocked /v1/* if you want.
export const DEV_MOCKS = import.meta.env.VITE_DEV_MOCKS === "true";
