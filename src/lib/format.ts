// Lightweight formatting helpers shared across pages. Kept in one file
// so the eventual switch to a real i18n/date library is a single import.

const dateTimeFmt = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDateTime(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return dateTimeFmt.format(d);
}

// Compact ago-string for "expires in 47m" / "12m ago". Capped at 24h
// because beyond that the absolute timestamp is more useful than a
// fuzzy relative one.
export function formatRelative(iso: string | undefined, now: Date = new Date()): string {
  if (!iso) return "—";
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return iso;
  const diffMs = target.getTime() - now.getTime();
  const sign = diffMs < 0 ? "ago" : "from now";
  const absMin = Math.round(Math.abs(diffMs) / 60_000);
  if (absMin < 1) return "just now";
  if (absMin < 60) return `${absMin}m ${sign}`;
  const absHr = Math.round(absMin / 60);
  if (absHr < 24) return `${absHr}h ${sign}`;
  return formatDateTime(iso);
}

export function shortSha(sha: string | undefined): string {
  if (!sha) return "—";
  return sha.slice(0, 7);
}
