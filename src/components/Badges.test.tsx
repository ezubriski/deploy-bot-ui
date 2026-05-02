import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EnvBadge, EventBadge, StateBadge } from "./Badges";

describe("EnvBadge", () => {
  it("highlights prod with the amber palette", () => {
    render(<EnvBadge env="prod" />);
    const el = screen.getByText("prod");
    expect(el.className).toContain("amber");
  });

  it("uses muted slate for non-prod envs", () => {
    render(<EnvBadge env="dev" />);
    const el = screen.getByText("dev");
    expect(el.className).toContain("slate");
    expect(el.className).not.toContain("amber");
  });

  it("treats 'production' the same as 'prod'", () => {
    render(<EnvBadge env="production" />);
    expect(screen.getByText("production").className).toContain("amber");
  });
});

describe("EventBadge", () => {
  it.each([
    ["approved", "emerald"],
    ["rejected", "red"],
    ["expired", "slate"],
    ["cancelled", "slate"],
  ] as const)("renders %s with the %s palette", (type, palette) => {
    render(<EventBadge type={type} />);
    expect(screen.getByText(type).className).toContain(palette);
  });
});

describe("StateBadge", () => {
  it("colors merged green and pending amber", () => {
    const { rerender } = render(<StateBadge state="pending" />);
    expect(screen.getByText("pending").className).toContain("amber");
    rerender(<StateBadge state="merged" />);
    expect(screen.getByText("merged").className).toContain("emerald");
  });
});
