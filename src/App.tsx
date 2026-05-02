import { Route, Routes } from "react-router";
import { useAuth } from "react-oidc-context";

import { NavBar } from "./components/NavBar";
import { HomePage } from "./pages/HomePage";

export function App() {
  const auth = useAuth();

  // The OIDC lib drives a few short-lived states (silent renew in flight,
  // signin redirect in flight). Render a placeholder rather than letting
  // pages flicker between unauthenticated and authenticated.
  if (auth.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">Loading…</p>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p className="text-red-400">Auth error: {auth.error.message}</p>
        <button
          onClick={() => auth.signinRedirect()}
          className="rounded bg-slate-800 px-4 py-2 hover:bg-slate-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-5xl p-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Callback path is hit only briefly during the OIDC redirect;
              AuthProvider's onSigninCallback strips params + sends us
              home, so we just render the home page here too. */}
          <Route path="/callback" element={<HomePage />} />
        </Routes>
      </main>
    </div>
  );
}
