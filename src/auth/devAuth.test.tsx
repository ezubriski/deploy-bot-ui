import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DevAuthProvider, useDevAuth } from "./devAuth";

const STORAGE_KEY = "deploy-bot-ui:dev-auth";

beforeEach(() => {
  window.sessionStorage.clear();
});
afterEach(() => {
  window.sessionStorage.clear();
});

function wrapper({ children }: { children: React.ReactNode }) {
  return <DevAuthProvider>{children}</DevAuthProvider>;
}

describe("DevAuthProvider", () => {
  it("starts unauthenticated when no creds in sessionStorage", () => {
    const { result } = renderHook(() => useDevAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.authorizationHeader).toBeNull();
  });

  it("hydrates creds from sessionStorage on mount", () => {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ username: "ops", basic: window.btoa("ops:pw") }),
    );
    const { result } = renderHook(() => useDevAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.username).toBe("ops");
    expect(result.current.authorizationHeader).toMatch(/^Basic /);
  });

  it("signIn stores creds and sets authenticated", () => {
    const { result } = renderHook(() => useDevAuth(), { wrapper });
    act(() => result.current.signIn("alice", "secret"));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.username).toBe("alice");
    expect(result.current.authorizationHeader).toBe(
      `Basic ${window.btoa("alice:secret")}`,
    );
    const stored = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY)!);
    expect(stored.username).toBe("alice");
  });

  it("signOut clears creds and sessionStorage", () => {
    const { result } = renderHook(() => useDevAuth(), { wrapper });
    act(() => result.current.signIn("alice", "secret"));
    act(() => result.current.signOut());
    expect(result.current.isAuthenticated).toBe(false);
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("ignores malformed sessionStorage entries", () => {
    window.sessionStorage.setItem(STORAGE_KEY, "{not json");
    const { result } = renderHook(() => useDevAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
  });
});

describe("useDevAuth contract", () => {
  it("throws when used outside the provider", () => {
    // Suppress the React error boundary console output for this assertion.
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => renderHook(() => useDevAuth())).toThrow(
      /must be used inside <DevAuthProvider>/,
    );
    spy.mockRestore();
  });
});

// Lightweight smoke test that a child component can read username via
// the hook after a real user interaction — guards against future
// refactors that subtly break the context wiring.
describe("DevAuthProvider — interactive", () => {
  function Probe() {
    const dev = useDevAuth();
    return (
      <div>
        <span data-testid="state">
          {dev.isAuthenticated ? `in:${dev.username}` : "out"}
        </span>
        <button onClick={() => dev.signIn("u", "p")}>go</button>
      </div>
    );
  }

  it("flips state in response to a click", async () => {
    const user = userEvent.setup();
    render(
      <DevAuthProvider>
        <Probe />
      </DevAuthProvider>,
    );
    expect(screen.getByTestId("state")).toHaveTextContent("out");
    await user.click(screen.getByRole("button", { name: "go" }));
    expect(screen.getByTestId("state")).toHaveTextContent("in:u");
  });
});
