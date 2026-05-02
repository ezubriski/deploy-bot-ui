import type { APIErrorBody } from "./types";

// Errors thrown by apiFetch carry the HTTP status so hooks can branch
// on it (401 → trigger re-login, 404 → render an empty state, etc.)
// without parsing the message text.
export class APIError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "APIError";
  }
}

// AuthExpiredError is thrown specifically for 401s. Keeps the call site
// simple: catch this, kick off `auth.signinSilent()` or redirect, retry.
export class AuthExpiredError extends APIError {
  constructor(message = "auth expired") {
    super(401, message);
    this.name = "AuthExpiredError";
  }
}

interface FetchOptions extends Omit<RequestInit, "headers"> {
  token: string;
  signal?: AbortSignal;
}

// All API calls go through one wrapper so error parsing, content-type
// handling, and the bearer header live in one place. Path is relative —
// the dev server proxies /v1/* to bin/api, and in production nginx does
// the same path-prefix split in front of the static SPA.
export async function apiFetch<T>(
  path: string,
  { token, signal, ...init }: FetchOptions,
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    signal,
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) throw new AuthExpiredError();

  if (!res.ok) {
    const body = (await res
      .json()
      .catch(() => ({ error: res.statusText }))) as APIErrorBody;
    throw new APIError(res.status, body.error || res.statusText);
  }

  // Every endpoint returns JSON; an empty body is an unexpected case
  // worth surfacing rather than silently returning undefined-as-T.
  return (await res.json()) as T;
}
