# deploy-bot-ui

Read-only dashboard for [deploy-bot](https://github.com/ezubriski/deploy-bot). Authenticates against the operator's Keycloak realm (PKCE, public client) and consumes the read-only HTTP API exposed by `cmd/api`.

The UI does no server-side rendering and stores no state of its own — it's a static SPA that talks to deploy-bot's API directly. Authentication is enforced by the API; this UI just drives the user through the OIDC code flow and forwards the resulting ID token on every request.

## Local development

Prereqs:

- Node 20+ (tested with 25)
- A running `bin/api` instance with OIDC configured (see [docs/integration-test-setup.md](https://github.com/ezubriski/deploy-bot/blob/main/docs/integration-test-setup.md) in the deploy-bot repo)
- A configured Keycloak `deploy-bot-ui` client (public, PKCE, with `http://localhost:5173/*` in valid redirect URIs)

```bash
cp .env.example .env.local
# edit .env.local — at minimum, set VITE_OIDC_ISSUER and VITE_API_PROXY
npm install
npm run dev
```

Open <http://localhost:5173>. Vite proxies `/v1/*` to `VITE_API_PROXY` (default `http://localhost:8080`), so the API client only ever calls relative URLs.

## Build

```bash
npm run build       # outputs static bundle to dist/
npm run preview     # serves dist/ for a sanity check
```

## Architecture

- **Vite + React 19 + TypeScript** — static SPA, no SSR
- **react-oidc-context** — handles PKCE, silent refresh, token storage in `sessionStorage`
- **react-router** — client-side routing
- **Tailwind v4** — styling (single `@import "tailwindcss"` in `src/index.css`)

Production deploy: nginx pod that serves `dist/` and reverse-proxies `/v1/*` to `deploy-bot-api.deploy-bot.svc:8080`. Same-origin → no CORS to configure on the API.

## Status

- [x] Chunk 1 — scaffold, OIDC login/logout, claims display
- [ ] Chunk 2 — typed API client + apps page
- [ ] Chunk 3 — app detail, deploy detail, SHA lookup, Containerfile, k8s manifests
