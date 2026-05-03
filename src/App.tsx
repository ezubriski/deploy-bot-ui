import { Navigate, Route, Routes } from "react-router";

import { NavBar } from "./components/NavBar";
import { AuthGuard } from "./components/AuthGuard";
import { useAuthState } from "./auth/useAuthState";
import { AppsPage } from "./pages/AppsPage";
import { AppDetailPage } from "./pages/AppDetailPage";
import { DeployDetailPage } from "./pages/DeployDetailPage";
import { HistoryLookupPage } from "./pages/HistoryLookupPage";
import { MePage } from "./pages/MePage";

export function App() {
  const auth = useAuthState();

  if (auth.error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p className="text-red-400">Auth error: {auth.error.message}</p>
        <button
          onClick={auth.signIn}
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
          <Route
            path="/"
            element={
              <AuthGuard>
                <AppsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/apps/:appEnv"
            element={
              <AuthGuard>
                <AppDetailPage />
              </AuthGuard>
            }
          />
          <Route
            path="/deploys/:org/:repo/:pr"
            element={
              <AuthGuard>
                <DeployDetailPage />
              </AuthGuard>
            }
          />
          <Route
            path="/history"
            element={
              <AuthGuard>
                <HistoryLookupPage />
              </AuthGuard>
            }
          />
          <Route
            path="/me"
            element={
              <AuthGuard>
                <MePage />
              </AuthGuard>
            }
          />
          {/* AuthProvider parses ?code=&state= in a useEffect on mount.
              A render-phase Navigate would strip the params before the
              effect runs, so we wait for auth.isLoading to flip false
              before sending the user home. */}
          <Route
            path="/callback"
            element={
              auth.isLoading ? (
                <p className="pt-6 text-slate-400">Signing in…</p>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </main>
    </div>
  );
}
