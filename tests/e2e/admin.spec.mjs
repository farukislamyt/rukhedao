import { test, expect } from "@playwright/test";

test("admin login reaches the protected dashboard", async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;

  test.skip(!email || !password, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD for admin E2E.");

  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|লগইন|প্রবেশ/i }).click();
  await page.waitForURL(/\/admin$/);
  await expect(page).toHaveURL(/\/admin$/);
});
