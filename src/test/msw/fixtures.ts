import type { App, HistoryEntry, PendingDeploy } from "../../api/types";

// Shared fixtures so unit tests, e2e tests, and dev-mock browser sessions
// all see the same data. Keep counts small but representative — one prod
// row, one dev row, both auth states (operator + repo source), and at
// least one entry per event_type so badges have something to render.

export const apps: App[] = [
  {
    app: "checkout",
    environment: "prod",
    full_name: "checkout-prod",
    source: "operator",
    auto_deploy: false,
  },
  {
    app: "checkout",
    environment: "dev",
    full_name: "checkout-dev",
    source: "operator",
    auto_deploy: true,
  },
  {
    app: "billing",
    environment: "prod",
    full_name: "billing-prod",
    source: "repo",
    source_repo: "acme/billing",
    auto_deploy: false,
  },
];

export const history: Record<string, HistoryEntry[]> = {
  "checkout-prod": [
    {
      github_org: "acme",
      github_repo: "gitops",
      event_type: "approved",
      app: "checkout-prod",
      environment: "prod",
      tag: "v1.42.0",
      pr_number: 1234,
      pr_url: "https://github.com/acme/gitops/pull/1234",
      approver_id: "U_APPROVER",
      requester_id: "U_REQUESTER",
      completed_at: "2026-04-30T18:21:11Z",
      gitops_commit_sha: "9f8c1ab2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
    },
    {
      github_org: "acme",
      github_repo: "gitops",
      event_type: "rejected",
      app: "checkout-prod",
      environment: "prod",
      tag: "v1.41.9",
      pr_number: 1230,
      approver_id: "U_APPROVER",
      requester_id: "U_REQUESTER",
      completed_at: "2026-04-30T15:02:50Z",
    },
    {
      github_org: "acme",
      github_repo: "gitops",
      event_type: "expired",
      app: "checkout-prod",
      environment: "prod",
      tag: "v1.41.8",
      requester_id: "U_REQUESTER",
      completed_at: "2026-04-29T22:18:00Z",
    },
  ],
  "checkout-dev": [],
  "billing-prod": [
    {
      github_org: "acme",
      github_repo: "billing-gitops",
      event_type: "cancelled",
      app: "billing-prod",
      environment: "prod",
      tag: "v3.0.1",
      requester_id: "U_REQUESTER",
      completed_at: "2026-05-01T11:00:00Z",
    },
  ],
};

// Pending rows are anchored to "now" so the rendered "expires in 1h"
// stays accurate regardless of when fixtures are read. requested_at is
// 30m in the past, expires_at is 90m in the future — typical of a
// freshly opened request waiting on approval.
const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();
const minutesAhead = (m: number) => new Date(now + m * 60_000).toISOString();

export const pending: Record<string, PendingDeploy[]> = {
  "checkout-prod": [
    {
      github_org: "acme",
      github_repo: "gitops",
      app: "checkout-prod",
      environment: "prod",
      tag: "v1.42.1",
      pr_number: 1240,
      pr_url: "https://github.com/acme/gitops/pull/1240",
      requester: "alice",
      requester_id: "U_REQUESTER",
      approver_id: "",
      reason: "ship release notes fix",
      requested_at: minutesAgo(30),
      expires_at: minutesAhead(90),
      state: "pending",
    },
  ],
  "checkout-dev": [],
  "billing-prod": [],
};

// flat lookup for /v1/deploys/{org}/{repo}/{pr}
export const allPending: PendingDeploy[] = Object.values(pending).flat();
