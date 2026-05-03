import { useState } from "react";

import { useDevAuth } from "../auth/devAuth";

// Inline username/password form rendered in dev-auth mode. Submits
// against the in-memory provider; the resulting Basic header is then
// attached to every /v1/* call. There is no network round-trip here —
// the API verifies the credentials on the first protected request and
// the AuthGuard re-renders to "signed in" optimistically.
export function DevAuthForm() {
  const dev = useDevAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) return;
    dev.signIn(username, password);
  }

  return (
    <div className="flex flex-col items-start gap-4 pt-12">
      <h1 className="text-2xl font-semibold">Sign in (dev)</h1>
      <p className="max-w-prose text-slate-400">
        Dev-auth mode is enabled. The API must be running with{" "}
        <code className="rounded bg-slate-800 px-1 text-xs">
          api.enable_admin_account=true
        </code>{" "}
        and matching credentials.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 w-full max-w-sm">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">Username</span>
          <input
            autoFocus
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={!username || !password}
          className="self-start rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
