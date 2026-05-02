import type { ReactNode } from "react";
import { useAuth } from "react-oidc-context";

// Renders children only when the user is authenticated. Unauth'd users
// see a short call-to-action with a sign-in button rather than an
// auto-redirect — auto-redirect on every protected page is jarring and
// breaks deep-linking. Once chunk 2 settles we can revisit if a
// silent-redirect makes more sense.
export function AuthGuard({ children }: { children: ReactNode }) {
  const auth = useAuth();

  if (auth.isLoading) {
    return <p className="pt-6 text-slate-400">Loading…</p>;
  }
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
  return <>{children}</>;
}
