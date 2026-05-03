import type { ReactNode } from "react";

import { useAuthState } from "../auth/useAuthState";
import { DEV_AUTH } from "../auth/mode";
import { DevAuthForm } from "./DevAuthForm";

// Renders children only when the user is authenticated. Unauth'd users
// see a sign-in CTA — Keycloak in OIDC mode, an inline Basic form in
// dev-auth mode. We intentionally don't auto-redirect on every protected
// page: it's jarring and breaks deep-linking.
export function AuthGuard({ children }: { children: ReactNode }) {
  const auth = useAuthState();

  if (auth.isLoading) {
    return <p className="pt-6 text-slate-400">Loading…</p>;
  }
  if (!auth.isAuthenticated) {
    if (DEV_AUTH) {
      return <DevAuthForm />;
    }
    return (
      <div className="flex flex-col items-start gap-4 pt-12">
        <h1 className="text-2xl font-semibold">Sign in to continue</h1>
        <p className="text-slate-400">
          deploy-bot dashboard. Authentication is handled by your Keycloak
          realm; no account is created here.
        </p>
        <button
          onClick={auth.signIn}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
        >
          Sign in with Keycloak
        </button>
      </div>
    );
  }
  return <>{children}</>;
}
