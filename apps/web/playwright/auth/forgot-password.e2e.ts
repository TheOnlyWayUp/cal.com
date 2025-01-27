import { expect } from "@playwright/test";

import { test } from "../lib/fixtures";

test.afterEach(({ users }) => users.deleteAll());

test("Can reset forgotten password", async ({ page, users }) => {
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(process.env.NEXT_PUBLIC_IS_E2E !== "1", "It shouldn't if we can't skip email");
  const user = await users.create();
  const newPassword = `${user.username}-123`;
  // Got to reset password flow
  await page.goto("/auth/forgot-password");

  await page.waitForSelector("text=Forgot Password");
  // Fill [placeholder="john.doe@example.com"]
  await page.fill('input[name="email"]', `${user.username}@example.com`);

  // Press Enter
  await Promise.all([
    page.waitForURL((u) => u.pathname.startsWith("/auth/forgot-password/")),
    page.press('input[name="email"]', "Enter"),
  ]);

  // Wait for page to fully load
  await page.waitForSelector("text=Reset Password");
  // Fill input[name="password"]
  await page.fill('input[name="password"]', newPassword);

  // Click text=Submit
  await page.click('button[type="submit"]');

  await page.waitForSelector("text=Password updated");

  await expect(page.locator(`text=Password updated`)).toBeVisible();
  // Click button:has-text("Login")
  await Promise.all([
    page.waitForURL((u) => u.pathname.startsWith("/auth/login")),
    page.click('a:has-text("Login")'),
  ]);

  // Fill input[name="email"]
  await page.fill('input[name="email"]', `${user.username}@example.com`);
  await page.fill('input[name="password"]', newPassword);
  await page.press('input[name="password"]', "Enter");
  await page.waitForSelector("[data-testid=dashboard-shell]");

  await expect(page.locator("[data-testid=dashboard-shell]")).toBeVisible();
});
