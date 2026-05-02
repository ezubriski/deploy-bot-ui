import { useMemo } from "react";
import { Link, useParams } from "react-router";
import { type ColumnDef } from "@tanstack/react-table";

import { useAppHistory, useAppPending } from "../api/hooks";
import { Table } from "../components/Table";
import { EnvBadge, EventBadge, StateBadge } from "../components/Badges";
import { formatDateTime, formatRelative, shortSha } from "../lib/format";
import type { HistoryEntry, PendingDeploy } from "../api/types";

// Detail view for a single app+env. Pending deploys above history because
// pending is what the operator usually opened the page to investigate;
// history is the longer scrollable record below.
export function AppDetailPage() {
  const { appEnv = "" } = useParams<{ appEnv: string }>();

  const pendingQ = useAppPending(appEnv);
  const historyQ = useAppHistory(appEnv);

  const pendingCols = useMemo<ColumnDef<PendingDeploy>[]>(
    () => [
      {
        accessorKey: "tag",
        header: "Tag",
        cell: ({ row }) => <span className="font-mono">{row.original.tag}</span>,
      },
      {
        accessorKey: "state",
        header: "State",
        cell: ({ row }) => <StateBadge state={row.original.state} />,
      },
      {
        accessorKey: "requester",
        header: "Requester",
      },
      {
        accessorKey: "approver_id",
        header: "Approver",
        cell: ({ row }) =>
          row.original.approver_id ? (
            <span className="font-mono text-xs">{row.original.approver_id}</span>
          ) : (
            <span className="text-slate-500">—</span>
          ),
      },
      {
        accessorKey: "expires_at",
        header: "Expires",
        cell: ({ row }) => (
          <span title={formatDateTime(row.original.expires_at)}>
            {formatRelative(row.original.expires_at)}
          </span>
        ),
      },
      {
        accessorKey: "pr_number",
        header: "PR",
        cell: ({ row }) => (
          <Link
            to={`/deploys/${encodeURIComponent(row.original.github_org)}/${encodeURIComponent(row.original.github_repo)}/${row.original.pr_number}`}
            className="font-mono text-blue-400 hover:underline"
          >
            #{row.original.pr_number}
          </Link>
        ),
      },
    ],
    [],
  );

  const historyCols = useMemo<ColumnDef<HistoryEntry>[]>(
    () => [
      {
        accessorKey: "completed_at",
        header: "When",
        cell: ({ row }) => (
          <span title={formatDateTime(row.original.completed_at)}>
            {formatRelative(row.original.completed_at)}
          </span>
        ),
      },
      {
        accessorKey: "event_type",
        header: "Outcome",
        cell: ({ row }) => <EventBadge type={row.original.event_type} />,
      },
      {
        accessorKey: "tag",
        header: "Tag",
        cell: ({ row }) => <span className="font-mono">{row.original.tag}</span>,
      },
      {
        accessorKey: "requester_id",
        header: "Requester",
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.requester_id}</span>
        ),
      },
      {
        accessorKey: "approver_id",
        header: "Approver",
        cell: ({ row }) =>
          row.original.approver_id ? (
            <span className="font-mono text-xs">{row.original.approver_id}</span>
          ) : (
            <span className="text-slate-500">—</span>
          ),
      },
      {
        accessorKey: "gitops_commit_sha",
        header: "SHA",
        cell: ({ row }) =>
          row.original.gitops_commit_sha ? (
            <Link
              to={`/history?sha=${row.original.gitops_commit_sha}`}
              className="font-mono text-xs text-blue-400 hover:underline"
              title={row.original.gitops_commit_sha}
            >
              {shortSha(row.original.gitops_commit_sha)}
            </Link>
          ) : (
            <span className="text-slate-500">—</span>
          ),
      },
      {
        accessorKey: "pr_number",
        header: "PR",
        cell: ({ row }) =>
          row.original.pr_url && row.original.pr_number ? (
            <a
              href={row.original.pr_url}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-blue-400 hover:underline"
            >
              #{row.original.pr_number}
            </a>
          ) : (
            <span className="text-slate-500">—</span>
          ),
      },
    ],
    [],
  );

  // env is derived from the rows since we don't fetch the AppConfig here.
  const env = pendingQ.data?.[0]?.environment ?? historyQ.data?.[0]?.environment;

  return (
    <div className="flex flex-col gap-6 pt-6">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">
          ← Apps
        </Link>
        <h1 className="text-2xl font-semibold font-mono">{appEnv}</h1>
        {env && <EnvBadge env={env} />}
      </div>

      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Pending</h2>
          {pendingQ.data && (
            <p className="text-sm text-slate-500">{pendingQ.data.length} in flight</p>
          )}
        </div>
        {pendingQ.isLoading && <p className="text-slate-400">Loading…</p>}
        {pendingQ.error && (
          <ErrorBox message={pendingQ.error.message} />
        )}
        {pendingQ.data && (
          <Table
            data={pendingQ.data}
            columns={pendingCols}
            emptyMessage="No deploys in flight."
          />
        )}
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">History</h2>
          {historyQ.data && (
            <p className="text-sm text-slate-500">last {historyQ.data.length}</p>
          )}
        </div>
        {historyQ.isLoading && <p className="text-slate-400">Loading…</p>}
        {historyQ.error && <ErrorBox message={historyQ.error.message} />}
        {historyQ.data && (
          <Table
            data={historyQ.data}
            columns={historyCols}
            emptyMessage="No deploy history yet."
          />
        )}
      </section>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded border border-red-900 bg-red-950/40 p-4 text-red-300">
      {message}
    </div>
  );
}
