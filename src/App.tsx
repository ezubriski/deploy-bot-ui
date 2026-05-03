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
          {/* The OIDC lib's onSigninCallback strips params and replaces
              history; rendering Navigate keeps the URL clean if a user
              ever lands here directly. */}
          <Route path="/callback" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
