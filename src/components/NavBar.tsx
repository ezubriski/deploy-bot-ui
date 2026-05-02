import { Link, NavLink } from "react-router";

import { useAuthState } from "../auth/useAuthState";
import { DEV_AUTH } from "../auth/mode";

export function NavBar() {
  const auth = useAuthState();

  return (
    <header className="border-b border-slate-800 bg-slate-900/50">
      <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="font-mono text-lg font-semibold text-slate-100"
          >
            deploy-bot
          </Link>
          {auth.isAuthenticated && (
            <nav className="flex items-center gap-4 text-sm">
              <NavLink
                to="/"
                end
                className={navLinkClass}
              >
                Apps
              </NavLink>
              <NavLink to="/history" className={navLinkClass}>
                Lookup
              </NavLink>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          {DEV_AUTH && (
            <span
              title="Dev-auth mode (HTTP Basic). Set VITE_DEV_AUTH=false for OIDC."
              className="rounded bg-amber-900/40 px-2 py-0.5 text-xs font-medium text-amber-300"
            >
              dev-auth
            </span>
          )}
          {auth.isAuthenticated ? (
            <>
              <NavLink to="/me" className={navLinkClass}>
                {auth.displayName ?? "signed in"}
              </NavLink>
              <button
                onClick={auth.signOut}
                className="rounded border border-slate-700 px-3 py-1 text-slate-200 hover:bg-slate-800"
              >
                Sign out
              </button>
            </>
          ) : (
            !DEV_AUTH && (
              <button
                onClick={auth.signIn}
                className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-500"
              >
                Sign in
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}

function navLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? "text-slate-100" : "text-slate-400 hover:text-slate-200";
}
