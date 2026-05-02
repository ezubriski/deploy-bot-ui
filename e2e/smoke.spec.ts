import { expect, test } from "@playwright/test";

// End-to-end smoke against the dev server in dev-auth + MSW mode. Walks
// the four routes a user actually visits (apps → app detail → deploy
// detail → SHA lookup) and the two auth boundaries (signed-out gate,
// sign-out flow). Fixtures come from src/test/msw/fixtures so unit and
// e2e tests assert against the same data.

test.describe("deploy-bot-ui smoke", () => {
  test("auth gate then full navigation", async ({ page }) => {
    await page.goto("/");

    // Auth gate: dev-auth form is visible because no creds in storage.
    await expect(page.getByRole("heading", { name: "Sign in (dev)" })).toBeVisible();
    await expect(page.getByText("dev-auth", { exact: true })).toBeVisible();

    await page.getByLabel("Username").fill("ops");
    await page.getByLabel("Password").fill("s3cret");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Apps page renders the three fixture rows.
    await expect(page.getByRole("heading", { name: "Apps" })).toBeVisible();
    await expect(page.getByRole("link", { name: "checkout-prod" })).toBeVisible();
    await expect(page.getByRole("link", { name: "checkout-dev" })).toBeVisible();
    await expect(page.getByRole("link", { name: "billing-prod" })).toBeVisible();

    // Drill into checkout-prod — should render a pending row + history.
    await page.getByRole("link", { name: "checkout-prod" }).click();
    await expect(page).toHaveURL(/\/apps\/checkout-prod$/);
    await expect(page.getByRole("heading", { name: "checkout-prod" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pending" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "History" })).toBeVisible();
    // Pending row is the v1.42.1 deploy from fixtures.
    await expect(page.getByRole("cell", { name: "v1.42.1" })).toBeVisible();
    // History contains both approved and rejected outcomes.
    await expect(page.getByText("approved")).toBeVisible();
    await expect(page.getByText("rejected")).toBeVisible();

    // Click into the pending PR → deploy detail.
    await page.getByRole("link", { name: "#1240" }).click();
    await expect(page).toHaveURL(/\/deploys\/acme\/gitops\/1240$/);
    await expect(
      page.getByRole("heading", { name: "acme/gitops#1240" }),
    ).toBeVisible();
    await expect(page.getByText("ship release notes fix")).toBeVisible();

    // SHA lookup works end-to-end.
    await page.getByRole("link", { name: "Lookup" }).click();
    await expect(page).toHaveURL(/\/history$/);
    await page
      .getByPlaceholder(/9f8c1ab2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8/)
      .fill("9f8c1ab2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8");
    await page.getByRole("button", { name: "Lookup" }).click();
    await expect(page).toHaveURL(
      /\/history\?sha=9f8c1ab2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8$/,
    );
    await expect(page.getByText("v1.42.0")).toBeVisible();

    // Identity page reflects the dev account.
    await page.getByRole("link", { name: /ops \(dev\)/ }).click();
    await expect(page).toHaveURL(/\/me$/);
    await expect(page.getByText("Dev admin")).toBeVisible();

    // Sign out → back to the dev-auth form.
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.getByRole("heading", { name: "Sign in (dev)" })).toBeVisible();
  });

  test("missing SHA renders a friendly 404", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Username").fill("ops");
    await page.getByLabel("Password").fill("s3cret");
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.getByRole("link", { name: "Lookup" }).click();
    await page.getByPlaceholder(/9f8c1ab/).fill("0000000000000000000000000000000000000000");
    await page.getByRole("button", { name: "Lookup" }).click();
    await expect(page.getByText(/No deploy found for/)).toBeVisible();
  });

  test("missing deploy 404s with helpful copy", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Username").fill("ops");
    await page.getByLabel("Password").fill("s3cret");
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.goto("/deploys/acme/gitops/9999");
    await expect(page.getByText(/Deploy not found/)).toBeVisible();
  });
});
