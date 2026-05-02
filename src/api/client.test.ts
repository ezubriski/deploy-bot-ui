import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "../test/msw/server";
import { APIError, AuthExpiredError, apiFetch } from "./client";

describe("apiFetch", () => {
  it("returns parsed JSON on 200", async () => {
    server.use(
      http.get("*/v1/ping", () => HttpResponse.json({ ok: true, n: 7 })),
    );
    const out = await apiFetch<{ ok: boolean; n: number }>("/v1/ping", {
      authorization: "Basic abc",
    });
    expect(out).toEqual({ ok: true, n: 7 });
  });

  it("forwards the Authorization header verbatim", async () => {
    let seen = "";
    server.use(
      http.get("*/v1/ping", ({ request }) => {
        seen = request.headers.get("Authorization") ?? "";
        return HttpResponse.json({});
      }),
    );
    await apiFetch("/v1/ping", { authorization: "Bearer my-token" });
    expect(seen).toBe("Bearer my-token");
  });

  it("throws AuthExpiredError on 401", async () => {
    server.use(
      http.get("*/v1/ping", () =>
        HttpResponse.json({ error: "expired" }, { status: 401 }),
      ),
    );
    await expect(
      apiFetch("/v1/ping", { authorization: "Basic abc" }),
    ).rejects.toBeInstanceOf(AuthExpiredError);
  });

  it("throws APIError with the body's error message on 5xx", async () => {
    server.use(
      http.get("*/v1/ping", () =>
        HttpResponse.json({ error: "boom" }, { status: 500 }),
      ),
    );
    try {
      await apiFetch("/v1/ping", { authorization: "Basic abc" });
      expect.fail("expected throw");
    } catch (err) {
      expect(err).toBeInstanceOf(APIError);
      expect((err as APIError).status).toBe(500);
      expect((err as APIError).message).toBe("boom");
    }
  });

  it("falls back to statusText when the body is not JSON", async () => {
    server.use(
      http.get("*/v1/ping", () =>
        new HttpResponse("oops", { status: 502, statusText: "Bad Gateway" }),
      ),
    );
    try {
      await apiFetch("/v1/ping", { authorization: "Basic abc" });
      expect.fail("expected throw");
    } catch (err) {
      expect((err as APIError).status).toBe(502);
      expect((err as APIError).message).toBe("Bad Gateway");
    }
  });
});
