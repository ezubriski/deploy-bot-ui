import { useQuery } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";

import { apiFetch } from "./client";
import type { App, HistoryEntry, PendingDeploy } from "./types";

// All hooks gate on isAuthenticated via react-query's `enabled` flag —
// this keeps cache keys consistent across login state changes and
// prevents firing requests while the auth lib is still hydrating from
// sessionStorage on initial load.
function useToken() {
  const auth = useAuth();
  return {
    token: auth.user?.id_token,
    enabled: auth.isAuthenticated && !!auth.user?.id_token,
  };
}

export function useApps() {
  const { token, enabled } = useToken();
  return useQuery({
    queryKey: ["apps"],
    queryFn: ({ signal }) => apiFetch<App[]>("/v1/apps", { token: token!, signal }),
    enabled,
  });
}

export function useAppHistory(appEnv: string, limit = 50) {
  const { token, enabled } = useToken();
  return useQuery({
    queryKey: ["apps", appEnv, "history", limit],
    queryFn: ({ signal }) =>
      apiFetch<HistoryEntry[]>(
        `/v1/apps/${encodeURIComponent(appEnv)}/history?limit=${limit}`,
        { token: token!, signal },
      ),
    enabled: enabled && !!appEnv,
  });
}

export function useAppPending(appEnv: string) {
  const { token, enabled } = useToken();
  return useQuery({
    queryKey: ["apps", appEnv, "pending"],
    queryFn: ({ signal }) =>
      apiFetch<PendingDeploy[]>(
        `/v1/apps/${encodeURIComponent(appEnv)}/pending`,
        { token: token!, signal },
      ),
    enabled: enabled && !!appEnv,
  });
}

export function useDeploy(org: string, repo: string, pr: number) {
  const { token, enabled } = useToken();
  return useQuery({
    queryKey: ["deploys", org, repo, pr],
    queryFn: ({ signal }) =>
      apiFetch<PendingDeploy>(
        `/v1/deploys/${encodeURIComponent(org)}/${encodeURIComponent(repo)}/${pr}`,
        { token: token!, signal },
      ),
    enabled: enabled && !!org && !!repo && pr > 0,
    retry: false,
  });
}

export function useHistoryBySha(sha: string) {
  const { token, enabled } = useToken();
  return useQuery({
    queryKey: ["history", "sha", sha],
    queryFn: ({ signal }) =>
      apiFetch<HistoryEntry>(`/v1/history?sha=${encodeURIComponent(sha)}`, {
        token: token!,
        signal,
      }),
    enabled: enabled && !!sha,
    retry: false,
  });
}
