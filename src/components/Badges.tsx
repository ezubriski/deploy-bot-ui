import type { EventType, PendingState } from "../api/types";

// Small status badges shared across pages. Colors are deliberate:
// approved/merged → green (terminal success), rejected → red,
// expired/cancelled → muted slate (terminal but not a failure),
// pending/merging → amber (in flight, needs attention).

const eventStyles: Record<EventType, string> = {
  approved: "bg-emerald-900/40 text-emerald-300",
  rejected: "bg-red-900/40 text-red-300",
  expired: "bg-slate-800 text-slate-400",
  cancelled: "bg-slate-800 text-slate-400",
};

export function EventBadge({ type }: { type: EventType }) {
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-medium ${eventStyles[type]}`}
    >
      {type}
    </span>
  );
}

const stateStyles: Record<PendingState, string> = {
  pending: "bg-amber-900/40 text-amber-300",
  merging: "bg-amber-900/40 text-amber-300",
  merged: "bg-emerald-900/40 text-emerald-300",
};

export function StateBadge({ state }: { state: PendingState }) {
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-medium ${stateStyles[state]}`}
    >
      {state}
    </span>
  );
}

export function EnvBadge({ env }: { env: string }) {
  const isProd = env.toLowerCase() === "prod" || env.toLowerCase() === "production";
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-medium ${
        isProd ? "bg-amber-900/40 text-amber-300" : "bg-slate-800 text-slate-300"
      }`}
    >
      {env}
    </span>
  );
}
