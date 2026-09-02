import { test, expect } from "@playwright/test";

const locale = "bn";

function mutationsEnabled() {
  return process.env.E2E_ALLOW_MUTATIONS === "true" && process.env.E2E_ENVIRONMENT === "staging";
}

test("public navigation and information pages render", async ({ page }) => {
  await page.goto(`/${locale}`);
  await expect(page).toHaveTitle(/RukheDao/i);

  await page.goto(`/${locale}/incidents`);
  await expect(page).toHaveURL(/\/bn\/incidents$/);

  for (const path of ["about", "how-it-works", "privacy", "content-policy", "security", "terms"]) {
    await page.goto(`/${locale}/${path}`);
    await expect(page.locator("main")).toBeVisible();
  }
});

test("report form renders its required controls", async ({ page }) => {
  await page.goto(`/${locale}/incident/new`);
  await expect(page.getByLabel(/title/i)).toBeVisible();
  await expect(page.getByLabel(/description/i)).toBeVisible();
  await expect(page.getByLabel(/category/i)).toBeVisible();
  await expect(page.getByLabel(/division/i)).toBeVisible();
  await expect(page.getByLabel(/district/i)).toBeVisible();
});

test("critical public report flow works in a staging environment", async ({ page }) => {
  test.skip(!mutationsEnabled(), "Write E2E is staging-only; set E2E_ALLOW_MUTATIONS=true and E2E_ENVIRONMENT=staging.");

  const hostname = new URL(process.env.E2E_BASE_URL).hostname;
  test.skip(hostname === "rukhedao.vercel.app", "Never run mutation E2E against production.");

  await page.goto(`/${locale}/incident/new`);

  const categories = page.locator("#incident-category option:not([value=''])");
  const divisions = page.locator("#incident-division option:not([value=''])");
  await expect(categories.first()).toBeVisible();
  await expect(divisions.first()).toBeVisible();

  await page.getByLabel(/title/i).fill(`E2E staging incident ${Date.now()}`);
  await page.getByLabel(/description/i).fill("Automated staging-only test incident for the RukheDao public reporting flow.");
  await page.getByLabel(/date/i).fill(new Date().toISOString().slice(0, 10));
  await page.locator("#incident-category").selectOption({ index: 1 });
  await page.locator("#incident-division").selectOption({ index: 1 });
  await page.locator("#incident-district").locator("option:not([value=''])").first().waitFor();
  await page.locator("#incident-district").selectOption({ index: 1 });
  await page.getByRole("button", { name: /submit|প্রতিবেদন/i }).click();

  const success = page.getByRole("status");
  await expect(success).toBeVisible();
  const publicId = (await success.locator("p.font-mono").textContent())?.trim();
  expect(publicId).toMatch(/^RK-[A-Z0-9]+$/);

  await page.goto(`/${locale}/incidents/${publicId}`);
  await expect(page).toHaveURL(new RegExp(`/bn/incidents/${publicId}$`));
});
