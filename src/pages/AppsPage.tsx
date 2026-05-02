import { useMemo } from "react";
import { Link } from "react-router";
import { type ColumnDef } from "@tanstack/react-table";

import { useApps } from "../api/hooks";
import { Table } from "../components/Table";
import type { App } from "../api/types";

export function AppsPage() {
  const { data, error, isLoading } = useApps();

  const columns = useMemo<ColumnDef<App>[]>(
    () => [
      {
        accessorKey: "full_name",
        header: "App",
        cell: ({ row }) => (
          <Link
            to={`/apps/${encodeURIComponent(row.original.full_name)}`}
            className="font-mono text-blue-400 hover:underline"
          >
            {row.original.full_name}
          </Link>
        ),
      },
      {
        accessorKey: "environment",
        header: "Environment",
        cell: ({ row }) => (
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${
              isProd(row.original.environment)
                ? "bg-amber-900/40 text-amber-300"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            {row.original.environment}
          </span>
        ),
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) =>
          row.original.source === "repo" ? (
            <span title={row.original.source_repo}>repo</span>
          ) : (
            <span className="text-slate-400">operator</span>
          ),
      },
      {
        accessorKey: "auto_deploy",
        header: "Auto",
        cell: ({ row }) =>
          row.original.auto_deploy ? (
            <span className="text-emerald-400">yes</span>
          ) : (
            <span className="text-slate-500">no</span>
          ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Apps</h1>
        {data && (
          <p className="text-sm text-slate-500">
            {data.length} configured
          </p>
        )}
      </div>

      {isLoading && <p className="text-slate-400">Loading…</p>}

      {error && (
        <div className="rounded border border-red-900 bg-red-950/40 p-4 text-red-300">
          {error.message}
        </div>
      )}

      {data && (
        <Table
          data={data}
          columns={columns}
          emptyMessage="No apps configured."
        />
      )}
    </div>
  );
}

function isProd(env: string): boolean {
  const e = env.toLowerCase();
  return e === "prod" || e === "production";
}
