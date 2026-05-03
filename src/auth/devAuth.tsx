import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

// Lightweight HTTP-Basic auth provider used when VITE_DEV_AUTH=true.
// Mirrors the slice of react-oidc-context's API the rest of the app
// depends on (isAuthenticated, isLoading, signin/out, profile) so
// components can stay unaware of which mode is active.
//
// Credentials live in sessionStorage rather than localStorage: a closed
// tab clears them, which keeps the dev-only path from becoming a
// long-lived bearer that lingers across browser restarts.

const STORAGE_KEY = "deploy-bot-ui:dev-auth";

interface DevCreds {
  username: string;
  // base64(username:password) — used directly as the Authorization
  // header value. Storing the encoded form avoids re-encoding on every
  // request and keeps the password out of the React tree as a string
  // literal.
  basic: string;
}

interface DevAuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  username: string | null;
  signIn(username: string, password: string): void;
  signOut(): void;
  authorizationHeader: string | null;
}

const DevAuthContext = createContext<DevAuthContextValue | null>(null);

function readStored(): DevCreds | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DevCreds;
    if (!parsed.username || !parsed.basic) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function DevAuthProvider({ children }: { children: ReactNode }) {
  // Hydrate synchronously from sessionStorage so the first render isn't
  // a flash of "signed out" for users who already authenticated this tab.
  const [creds, setCreds] = useState<DevCreds | null>(() => readStored());

  // Cross-tab sync: another tab signing out shouldn't leave this tab
  // displaying authenticated UI.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      setCreds(readStored());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signIn = useCallback((username: string, password: string) => {
    const basic = window.btoa(`${username}:${password}`);
    const next: DevCreds = { username, basic };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setCreds(next);
  }, []);

  const signOut = useCallback(() => {
    window.sessionStorage.removeItem(STORAGE_KEY);
    setCreds(null);
  }, []);

  const value = useMemo<DevAuthContextValue>(
    () => ({
      isAuthenticated: creds !== null,
      isLoading: false,
      error: null,
      username: creds?.username ?? null,
      signIn,
      signOut,
      authorizationHeader: creds ? `Basic ${creds.basic}` : null,
    }),
    [creds, signIn, signOut],
  );

  return <DevAuthContext.Provider value={value}>{children}</DevAuthContext.Provider>;
}

export function useDevAuth(): DevAuthContextValue {
  const ctx = useContext(DevAuthContext);
  if (!ctx) {
    throw new Error("useDevAuth must be used inside <DevAuthProvider>");
  }
  return ctx;
}
