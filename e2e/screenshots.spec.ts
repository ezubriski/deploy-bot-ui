import { expect, test } from "@playwright/test";
import path from "node:path";

// Captures one screenshot per page so a human reviewer can eyeball the
// visual result without booting the dev server. Outputs into /tmp so the
// repo stays clean — the run shell prints the absolute paths.

const OUT = "/tmp/deploy-bot-ui-shots";

test.describe("screenshots", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("captures every page", async ({ page }) => {
    async function shot(name: string) {
      const file = path.join(OUT, `${name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log("screenshot:", file);
    }

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Sign in (dev)" })).toBeVisible();
    await shot("01-signin");

    await page.getByLabel("Username").fill("ops");
    await page.getByLabel("Password").fill("s3cret");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByRole("heading", { name: "Apps" })).toBeVisible();
    await shot("02-apps");

    await page.getByRole("link", { name: "checkout-prod" }).click();
    await expect(page.getByRole("heading", { name: "checkout-prod" })).toBeVisible();
    await shot("03-app-detail");

    await page.goto("/deploys/acme/gitops/1240");
    await expect(page.getByRole("heading", { name: "acme/gitops#1240" })).toBeVisible();
    await shot("04-deploy-detail");

    await page.goto("/history?sha=9f8c1ab2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8");
    await expect(page.getByText("v1.42.0")).toBeVisible();
    await shot("05-history-lookup");

    await page.goto("/me");
    await expect(page.getByRole("heading", { name: "Identity" })).toBeVisible();
    await shot("06-me");
  });
});
