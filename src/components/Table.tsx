import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  emptyMessage?: string;
}

// Thin wrapper around @tanstack/react-table — keeps the markup local so
// columns can pick whichever Tailwind classes they need on a per-cell
// basis (status badges, monospace tags, link cells) instead of fighting
// a generic "data table" abstraction.
export function Table<T>({
  data,
  columns,
  emptyMessage = "No rows",
}: TableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (data.length === 0) {
    return <p className="py-8 text-center text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded border border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => {
                const sort = h.column.getIsSorted();
                const sortable = h.column.getCanSort();
                return (
                  <th
                    key={h.id}
                    onClick={
                      sortable ? h.column.getToggleSortingHandler() : undefined
                    }
                    className={`px-4 py-3 ${sortable ? "cursor-pointer select-none hover:text-slate-200" : ""}`}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {sort === "asc" && " ▲"}
                    {sort === "desc" && " ▼"}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-800">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-900/50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
