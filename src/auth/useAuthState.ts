import { useAuth as useOidcAuth } from "react-oidc-context";

import { DEV_AUTH } from "./mode";
import { useDevAuth } from "./devAuth";

// Unified shape that pages and AuthGuard render against. Drops the
// detail of which provider is active. Profile fields are intentionally
// minimal; the dev-auth path has no real claims so it synthesizes
// just enough to populate the nav and the /me page.
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  /** Bearer (OIDC) or Basic (dev-auth) header value, or null when signed out. */
  authorizationHeader: string | null;
  /** Display name — preferred_username, email, or "admin (dev)". */
  displayName: string | null;
  profile: {
    sub?: string;
    email?: string;
    name?: string;
    preferred_username?: string;
    groups?: string[];
  } | null;
  signIn(): void;
  signOut(): void;
}

// Hooks rules: we ALWAYS call both useDevAuth and useOidcAuth so the
// hook order is stable across renders. The unused one returns no-op
// state because its provider is mounted as a passthrough in the
// inactive mode (see main.tsx).
export function useAuthState(): AuthState {
  const dev = useDevAuth();
  const oidc = useOidcAuth();

  if (DEV_AUTH) {
    return {
      isAuthenticated: dev.isAuthenticated,
      isLoading: dev.isLoading,
      error: dev.error,
      authorizationHeader: dev.authorizationHeader,
      displayName: dev.username ? `${dev.username} (dev)` : null,
      profile: dev.username
        ? { sub: dev.username, preferred_username: dev.username, name: "Dev admin" }
        : null,
      // signIn() in dev-auth mode is a no-op here — the AuthGuard
      // renders an inline form that calls dev.signIn(user, pass)
      // directly, since there's no IdP to redirect to.
      signIn: () => undefined,
      signOut: dev.signOut,
    };
  }

  return {
    isAuthenticated: oidc.isAuthenticated,
    isLoading: oidc.isLoading,
    error: oidc.error ?? null,
    authorizationHeader: oidc.user?.id_token ? `Bearer ${oidc.user.id_token}` : null,
    displayName:
      (oidc.user?.profile.preferred_username as string | undefined) ??
      (oidc.user?.profile.email as string | undefined) ??
      null,
    profile: oidc.user?.profile
      ? {
          sub: oidc.user.profile.sub,
          email: oidc.user.profile.email as string | undefined,
          name: oidc.user.profile.name as string | undefined,
          preferred_username: oidc.user.profile.preferred_username as string | undefined,
          groups: oidc.user.profile.groups as string[] | undefined,
        }
      : null,
    signIn: () => oidc.signinRedirect(),
    signOut: () => oidc.removeUser(),
  };
}
