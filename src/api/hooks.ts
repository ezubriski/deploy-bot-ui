import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "./client";
import { useAuthState } from "../auth/useAuthState";
import type { App, HistoryEntry, PendingDeploy } from "./types";

// All hooks gate on isAuthenticated via react-query's `enabled` flag —
// this keeps cache keys consistent across login state changes and
// prevents firing requests while the auth lib is still hydrating.
function useAuthHeader() {
  const auth = useAuthState();
  return {
    authorization: auth.authorizationHeader,
    enabled: auth.isAuthenticated && !!auth.authorizationHeader,
  };
}

export function useApps() {
  const { authorization, enabled } = useAuthHeader();
  return useQuery({
    queryKey: ["apps"],
    queryFn: ({ signal }) => apiFetch<App[]>("/v1/apps", { authorization: authorization!, signal }),
    enabled,
  });
}

export function useAppHistory(appEnv: string, limit = 50) {
  const { authorization, enabled } = useAuthHeader();
  return useQuery({
    queryKey: ["apps", appEnv, "history", limit],
    queryFn: ({ signal }) =>
      apiFetch<HistoryEntry[]>(
        `/v1/apps/${encodeURIComponent(appEnv)}/history?limit=${limit}`,
        { authorization: authorization!, signal },
      ),
    enabled: enabled && !!appEnv,
  });
}

export function useAppPending(appEnv: string) {
  const { authorization, enabled } = useAuthHeader();
  return useQuery({
    queryKey: ["apps", appEnv, "pending"],
    queryFn: ({ signal }) =>
      apiFetch<PendingDeploy[]>(
        `/v1/apps/${encodeURIComponent(appEnv)}/pending`,
        { authorization: authorization!, signal },
      ),
    enabled: enabled && !!appEnv,
  });
}

export function useDeploy(org: string, repo: string, pr: number) {
  const { authorization, enabled } = useAuthHeader();
  return useQuery({
    queryKey: ["deploys", org, repo, pr],
    queryFn: ({ signal }) =>
      apiFetch<PendingDeploy>(
        `/v1/deploys/${encodeURIComponent(org)}/${encodeURIComponent(repo)}/${pr}`,
        { authorization: authorization!, signal },
      ),
    enabled: enabled && !!org && !!repo && pr > 0,
    retry: false,
  });
}

export function useHistoryBySha(sha: string) {
  const { authorization, enabled } = useAuthHeader();
  return useQuery({
    queryKey: ["history", "sha", sha],
    queryFn: ({ signal }) =>
      apiFetch<HistoryEntry>(`/v1/history?sha=${encodeURIComponent(sha)}`, {
        authorization: authorization!,
        signal,
      }),
    enabled: enabled && !!sha,
    retry: false,
  });
}
