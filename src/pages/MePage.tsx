import { useAuth } from "react-oidc-context";

// Debug-ish view: dumps the claims the API will see. Useful when
// authorization scoping by `groups` lands and we need to confirm what's
// actually in the token. Linked from the nav under the user's name.
export function MePage() {
  const auth = useAuth();
  const profile = auth.user?.profile;
  const groups = (profile?.groups as string[] | undefined) ?? [];

  return (
    <div className="flex flex-col gap-4 pt-6">
      <h1 className="text-2xl font-semibold">Identity</h1>
      <section className="rounded border border-slate-800 bg-slate-900/50 p-4">
        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-slate-400">Subject</dt>
          <dd className="font-mono">{profile?.sub}</dd>
          <dt className="text-slate-400">Email</dt>
          <dd>{profile?.email ?? "—"}</dd>
          <dt className="text-slate-400">Name</dt>
          <dd>{profile?.name ?? "—"}</dd>
          <dt className="text-slate-400">Username</dt>
          <dd>{profile?.preferred_username ?? "—"}</dd>
          <dt className="text-slate-400">Groups</dt>
          <dd>{groups.length === 0 ? "—" : groups.join(", ")}</dd>
        </dl>
      </section>
    </div>
  );
}
