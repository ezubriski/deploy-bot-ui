import { describe, expect, it } from "vitest";

import { formatRelative, shortSha } from "./format";

describe("formatRelative", () => {
  const now = new Date("2026-05-02T12:00:00Z");

  it("returns 'just now' for sub-minute deltas", () => {
    // 20s difference → rounds to 0 minutes → "just now".
    expect(formatRelative("2026-05-02T12:00:20Z", now)).toBe("just now");
  });

  it("returns m ago for past minutes", () => {
    expect(formatRelative("2026-05-02T11:30:00Z", now)).toBe("30m ago");
  });

  it("returns m from now for future minutes", () => {
    expect(formatRelative("2026-05-02T12:30:00Z", now)).toBe("30m from now");
  });

  it("rolls up to hours past 60m", () => {
    expect(formatRelative("2026-05-02T09:00:00Z", now)).toBe("3h ago");
  });

  it("falls back to absolute past 24h", () => {
    // Anything > 24h returns the formatted timestamp; just assert it's
    // not the relative form.
    const out = formatRelative("2026-04-29T09:00:00Z", now);
    expect(out).not.toContain("ago");
    expect(out).not.toContain("from now");
  });

  it("returns em-dash for missing input", () => {
    expect(formatRelative(undefined)).toBe("—");
  });
});

describe("shortSha", () => {
  it("trims to 7 chars", () => {
    expect(shortSha("9f8c1ab2c3d4e5f6a7b8")).toBe("9f8c1ab");
  });
  it("returns em-dash for missing input", () => {
    expect(shortSha(undefined)).toBe("—");
  });
});
