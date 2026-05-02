import { http, HttpResponse } from "msw";

import { apps, history, allPending, pending } from "./fixtures";

// Handlers use `*/v1/...` so they match both same-origin (browser dev,
// e2e) and direct fetches (vitest). Reordered list-routes before
// item-routes is unnecessary here because path patterns are distinct.
export const handlers = [
  http.get("*/v1/apps", ({ request }) => {
    requireAuth(request);
    return HttpResponse.json(apps);
  }),

  http.get("*/v1/apps/:appEnv/history", ({ request, params }) => {
    requireAuth(request);
    const appEnv = String(params.appEnv);
    return HttpResponse.json(history[appEnv] ?? []);
  }),

  http.get("*/v1/apps/:appEnv/pending", ({ request, params }) => {
    requireAuth(request);
    const appEnv = String(params.appEnv);
    return HttpResponse.json(pending[appEnv] ?? []);
  }),

  http.get("*/v1/deploys/:org/:repo/:pr", ({ request, params }) => {
    requireAuth(request);
    const pr = Number(params.pr);
    const found = allPending.find(
      (d) => d.github_org === params.org && d.github_repo === params.repo && d.pr_number === pr,
    );
    if (!found) {
      return HttpResponse.json({ error: "deploy not found" }, { status: 404 });
    }
    return HttpResponse.json(found);
  }),

  http.get("*/v1/history", ({ request }) => {
    requireAuth(request);
    const url = new URL(request.url);
    const sha = url.searchParams.get("sha") ?? "";
    if (!sha) {
      return HttpResponse.json({ error: "sha required" }, { status: 400 });
    }
    for (const entries of Object.values(history)) {
      const hit = entries.find((e) => e.gitops_commit_sha === sha);
      if (hit) return HttpResponse.json(hit);
    }
    return HttpResponse.json({ error: "no history for sha" }, { status: 404 });
  }),
];

// Mirrors the API's behavior: any /v1/* call without an Authorization
// header gets a 401. Lets us exercise the AuthGuard + retry flows in tests.
function requireAuth(request: Request): void {
  if (!request.headers.get("Authorization")) {
    throw HttpResponse.json({ error: "missing bearer token" }, { status: 401 });
  }
}
