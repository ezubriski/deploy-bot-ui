// Mirrors the JSON shapes returned by deploy-bot's /v1/* endpoints.
// Keep field names in sync with internal/api/server.go (`appView`) and
// internal/store types (HistoryEntry, PendingDeploy). The /v1 prefix is
// the stability contract — schema changes that rename store fields
// must update handler projections to keep these shapes stable.

export interface App {
  app: string;
  environment: string;
  full_name: string;
  source: "operator" | "repo";
  source_repo?: string;
  auto_deploy?: boolean;
}

export type EventType = "approved" | "rejected" | "expired" | "cancelled";

export interface HistoryEntry {
  github_org?: string;
  github_repo?: string;
  event_type: EventType;
  app: string;
  environment: string;
  tag: string;
  pr_number?: number;
  pr_url?: string;
  approver_id?: string;
  requester_id: string;
  completed_at: string; // RFC3339
  gitops_commit_sha?: string;
  slack_channel?: string;
  slack_message_ts?: string;
}

export type PendingState = "pending" | "merging" | "merged";

export interface PendingDeploy {
  github_org: string;
  github_repo: string;
  app: string;
  environment: string;
  tag: string;
  pr_number: number;
  pr_url: string;
  requester: string;
  requester_id: string;
  approver_id: string;
  reason: string;
  requested_at: string; // RFC3339
  expires_at: string; // RFC3339
  state: PendingState;
  slack_channel?: string;
  slack_message_ts?: string;
}

export interface APIErrorBody {
  error: string;
}
