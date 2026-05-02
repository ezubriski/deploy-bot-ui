# deploy-bot-ui

Read-only dashboard for [deploy-bot](https://github.com/ezubriski/deploy-bot). Authenticates against the operator's Keycloak realm (PKCE, public client) — or, in dev, against an opt-in HTTP Basic admin account on the API — and consumes the read-only HTTP API exposed by `cmd/api`.

The UI does no server-side rendering and stores no state of its own. It's a static SPA that talks to deploy-bot's API directly. Authentication is enforced by the API; this UI just drives the user through the OIDC code flow (or the basic-auth form, in dev) and forwards the resulting credential on every request.

## Local development

Prereqs:

- Node 20+ (tested with 25)
- Either: a running `bin/api` instance with OIDC configured (see [docs/integration-test-setup.md](https://github.com/ezubriski/deploy-bot/blob/main/docs/integration-test-setup.md) in the deploy-bot repo) **or** a `bin/api` started with `api.enable_admin_account=true`
- A configured Keycloak `deploy-bot-ui` client (public, PKCE, with `http://localhost:5173/*` in valid redirect URIs) — only required for OIDC mode

```bash
cp .env.example .env.local
# edit .env.local — pick OIDC mode (set VITE_OIDC_ISSUER) or
# dev-auth mode (set VITE_DEV_AUTH=true), then either way set VITE_API_PROXY
npm install
npm run dev
```

Open <http://localhost:5173>. Vite proxies `/v1/*` to `VITE_API_PROXY` (default `http://localhost:8080`), so the API client only ever calls relative URLs.

### Backend-less iteration (MSW)

For UI work that doesn't depend on real data, set `VITE_DEV_MOCKS=true` alongside `VITE_DEV_AUTH=true`. The browser registers a Service Worker that intercepts `/v1/*` and serves canned fixtures from `src/test/msw/fixtures.ts`. No `bin/api` required. The mock chunk is statically dead in production builds.

## Tests

```bash
npm run test          # vitest run — units + hook contracts (jsdom + MSW)
npm run test:watch    # interactive vitest UI
npm run e2e           # playwright (chromium) — boots vite in dev-auth + mock mode
npm run e2e:ui        # playwright with the inspector
```

## Build

```bash
npm run build       # outputs static bundle to dist/
npm run preview     # serves dist/ for a sanity check
```

## Container image

```bash
podman build -t deploy-bot-ui:dev -f Containerfile .
```

The Containerfile is multi-stage: a node 20 builder produces `dist/`, then `nginxinc/nginx-unprivileged` serves it on port 8080 as uid 101. Build args (`VITE_OIDC_ISSUER`, `VITE_OIDC_CLIENT_ID`) are baked into the bundle at compile time — there is no runtime config.

## Kubernetes

```bash
kubectl apply -k deploy/kustomize
```

Base ships:

- `Deployment` with `runAsNonRoot: true`, `readOnlyRootFilesystem: true`, `capabilities.drop: [ALL]`, `seccompProfile: RuntimeDefault`, and `automountServiceAccountToken: false`
- emptyDir volumes (`tmp`, `nginx-cache`, `nginx-run`) for nginx's writable paths so the root filesystem stays read-only
- `Service` (ClusterIP) — Ingress is left to operator overlays
- `ConfigMap` generated from `deploy/kustomize/nginx.conf` so editing the source file is enough

Replicas default to 0 — overlays should bump and add an Ingress. The nginx config reverse-proxies `/v1/*` to `deploy-bot-api.deploy-bot.svc.cluster.local:8080`; override the upstream in your overlay if the API lives elsewhere.

## Architecture

- **Vite + React 19 + TypeScript** — static SPA, no SSR
- **react-oidc-context** — handles PKCE, silent refresh, token storage in `sessionStorage`
- **react-router** — client-side routing
- **@tanstack/react-query** — caching for the five read-only endpoints (`/v1/apps`, `/v1/apps/{appEnv}/history`, `/v1/apps/{appEnv}/pending`, `/v1/deploys/{org}/{repo}/{pr}`, `/v1/history?sha=...`)
- **@tanstack/react-table** — sortable headers + per-cell custom rendering
- **Tailwind v4** — styling (single `@import "tailwindcss"` in `src/index.css`)

Two auth providers (`AuthProvider` from `react-oidc-context`, plus a local `DevAuthProvider`) are always mounted. `useAuthState` picks the active one based on `VITE_DEV_AUTH`; the inactive provider is a no-op. `apiFetch` takes an `Authorization` header value rather than a token, so it doesn't need to know which mode produced it.

Production deploy: the nginx pod above serves `dist/` and reverse-proxies `/v1/*` to `deploy-bot-api.deploy-bot.svc.cluster.local:8080`. Same-origin → no CORS.

## Pages

| Route | What it shows |
| --- | --- |
| `/` | All configured apps (env, source, auto-deploy flag) |
| `/apps/:appEnv` | Pending deploys + history for one app |
| `/deploys/:org/:repo/:pr` | A single in-flight deploy |
| `/history?sha=...` | Find the deploy that produced a gitops commit |
| `/me` | Token claims (debugging / authz scoping) |
