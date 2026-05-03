import { Link, useParams } from "react-router";

import { useDeploy } from "../api/hooks";
import { APIError } from "../api/client";
import { EnvBadge, StateBadge } from "../components/Badges";
import { formatDateTime, formatRelative } from "../lib/format";

// One PendingDeploy by (org, repo, pr). Shows the full record as a
// dl/dt/dd card — there's nothing tabular about a single row, and the
// dl gives screen readers a sane structure to walk.
export function DeployDetailPage() {
  const { org = "", repo = "", pr = "" } = useParams<{
    org: string;
    repo: string;
    pr: string;
  }>();
  const prNum = Number.parseInt(pr, 10);

  const { data, error, isLoading } = useDeploy(org, repo, prNum);

  if (Number.isNaN(prNum) || prNum <= 0) {
    return (
      <div className="pt-6">
        <p className="text-red-300">Invalid PR number: {pr}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-6">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">
          ← Apps
        </Link>
        <h1 className="text-2xl font-semibold font-mono">
          {org}/{repo}#{prNum}
        </h1>
      </div>

      {isLoading && <p className="text-slate-400">Loading…</p>}

      {error && (
        <div className="rounded border border-red-900 bg-red-950/40 p-4 text-red-300">
          {error instanceof APIError && error.status === 404
            ? "Deploy not found. It may have completed (check the app's history) or never existed."
            : error.message}
        </div>
      )}

      {data && (
        <section className="rounded border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center gap-3 pb-4">
            <Link
              to={`/apps/${encodeURIComponent(data.app)}`}
              className="text-lg font-semibold text-blue-400 hover:underline font-mono"
            >
              {data.app}
            </Link>
            <EnvBadge env={data.environment} />
            <StateBadge state={data.state} />
          </div>

          <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-slate-400">Tag</dt>
            <dd className="font-mono">{data.tag}</dd>

            <dt className="text-slate-400">Pull request</dt>
            <dd>
              {data.pr_url ? (
                <a
                  href={data.pr_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-blue-400 hover:underline"
                >
                  {data.github_org}/{data.github_repo}#{data.pr_number}
                </a>
              ) : (
                <span className="font-mono">
                  {data.github_org}/{data.github_repo}#{data.pr_number}
                </span>
              )}
            </dd>

            <dt className="text-slate-400">Requester</dt>
            <dd>
              {data.requester}{" "}
              <span className="font-mono text-xs text-slate-500">
                ({data.requester_id})
              </span>
            </dd>

            <dt className="text-slate-400">Approver</dt>
            <dd>
              {data.approver_id ? (
                <span className="font-mono text-xs">{data.approver_id}</span>
              ) : (
                <span className="text-slate-500">unassigned</span>
              )}
            </dd>

            <dt className="text-slate-400">Reason</dt>
            <dd>{data.reason || <span className="text-slate-500">—</span>}</dd>

            <dt className="text-slate-400">Requested</dt>
            <dd>
              <span title={formatDateTime(data.requested_at)}>
                {formatRelative(data.requested_at)}
              </span>
            </dd>

            <dt className="text-slate-400">Expires</dt>
            <dd>
              <span title={formatDateTime(data.expires_at)}>
                {formatRelative(data.expires_at)}
              </span>
            </dd>

            {data.slack_channel && (
              <>
                <dt className="text-slate-400">Slack</dt>
                <dd className="font-mono text-xs">
                  {data.slack_channel}
                  {data.slack_message_ts && ` · ${data.slack_message_ts}`}
                </dd>
              </>
            )}
          </dl>
        </section>
      )}
    </div>
  );
}
