import { useAuth } from "react-oidc-context";

// Chunk-1 home page: prove the auth round-trip works end to end. Once
// chunk 2 lands, this becomes the apps overview and the claims dump
// moves to a /me debug route (or disappears).
export function HomePage() {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return (
      <div className="flex flex-col items-start gap-4 pt-12">
        <h1 className="text-2xl font-semibold">Sign in to continue</h1>
        <p className="text-slate-400">
          deploy-bot dashboard. Authentication is handled by your Keycloak
          realm; no account is created here.
        </p>
        <button
          onClick={() => auth.signinRedirect()}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
        >
          Sign in with Keycloak
        </button>
      </div>
    );
  }

  const profile = auth.user?.profile;
  const groups = (profile?.groups as string[] | undefined) ?? [];

  return (
    <div className="flex flex-col gap-6 pt-6">
      <h1 className="text-2xl font-semibold">Signed in</h1>
      <section className="rounded border border-slate-800 bg-slate-900/50 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Identity
        </h2>
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
      <p className="text-sm text-slate-500">
        Apps, history, and pending deploys will land here in the next chunk.
      </p>
    </div>
  );
}
