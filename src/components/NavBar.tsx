import { useAuth } from "react-oidc-context";

export function NavBar() {
  const auth = useAuth();

  return (
    <header className="border-b border-slate-800 bg-slate-900/50">
      <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <div className="font-mono text-lg font-semibold text-slate-100">
          deploy-bot
        </div>
        <div className="flex items-center gap-3 text-sm">
          {auth.isAuthenticated ? (
            <>
              <span className="text-slate-400">
                {auth.user?.profile.preferred_username ??
                  auth.user?.profile.email ??
                  "signed in"}
              </span>
              <button
                onClick={() => auth.removeUser()}
                className="rounded border border-slate-700 px-3 py-1 text-slate-200 hover:bg-slate-800"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => auth.signinRedirect()}
              className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-500"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
