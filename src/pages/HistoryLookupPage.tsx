import { useState } from "react";
import { Link, useSearchParams } from "react-router";

import { useHistoryBySha } from "../api/hooks";
import { APIError } from "../api/client";
import { EnvBadge, EventBadge } from "../components/Badges";
import { formatDateTime, formatRelative, shortSha } from "../lib/format";

// "Where did this gitops SHA come from?" — operators paste a commit SHA
// from an Argo CD event or a kustomize file and get back the deploy
// that produced it. The SHA is in the URL so the result page can be
// shared verbatim in chat ("see /history?sha=abc123").
export function HistoryLookupPage() {
  const [params, setParams] = useSearchParams();
  const querySha = params.get("sha") ?? "";
  const [input, setInput] = useState(querySha);

  const { data, error, isLoading, isFetching } = useHistoryBySha(querySha);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      setParams({});
      return;
    }
    setParams({ sha: trimmed });
  }

  return (
    <div className="flex flex-col gap-6 pt-6">
      <div>
        <h1 className="text-2xl font-semibold">History lookup</h1>
        <p className="pt-1 text-sm text-slate-400">
          Paste a gitops commit SHA to find the deploy that produced it.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 9f8c1ab2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8"
          className="flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
        >
          Lookup
        </button>
      </form>

      {!querySha && (
        <p className="text-slate-500">Enter a SHA above to search.</p>
      )}

      {querySha && (isLoading || isFetching) && (
        <p className="text-slate-400">Searching…</p>
      )}

      {querySha && error && (
        <div className="rounded border border-red-900 bg-red-950/40 p-4 text-red-300">
          {error instanceof APIError && error.status === 404
            ? `No deploy found for ${shortSha(querySha)}. The SHA may be from a hand-edit or a different gitops repo.`
            : error.message}
        </div>
      )}

      {querySha && data && (
        <section className="rounded border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center gap-3 pb-4">
            <Link
              to={`/apps/${encodeURIComponent(data.app)}`}
              className="text-lg font-semibold text-blue-400 hover:underline font-mono"
            >
              {data.app}
            </Link>
            <EnvBadge env={data.environment} />
            <EventBadge type={data.event_type} />
          </div>

          <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-slate-400">Tag</dt>
            <dd className="font-mono">{data.tag}</dd>

            <dt className="text-slate-400">Gitops SHA</dt>
            <dd
              className="font-mono text-xs"
              title={data.gitops_commit_sha}
            >
              {data.gitops_commit_sha}
            </dd>

            {data.pr_number && (
              <>
                <dt className="text-slate-400">PR</dt>
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
                    <span className="font-mono">#{data.pr_number}</span>
                  )}
                </dd>
              </>
            )}

            <dt className="text-slate-400">Requester</dt>
            <dd className="font-mono text-xs">{data.requester_id}</dd>

            {data.approver_id && (
              <>
                <dt className="text-slate-400">Approver</dt>
                <dd className="font-mono text-xs">{data.approver_id}</dd>
              </>
            )}

            <dt className="text-slate-400">Completed</dt>
            <dd>
              <span title={formatDateTime(data.completed_at)}>
                {formatRelative(data.completed_at)}
              </span>
            </dd>
          </dl>
        </section>
      )}
    </div>
  );
}
