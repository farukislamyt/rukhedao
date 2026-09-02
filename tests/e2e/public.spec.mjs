import { test, expect } from "@playwright/test";

const locale = "bn";

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

test("public incident detail route renders", async ({ page }) => {
  await page.goto(`/${locale}/incidents`);
  const incidentLink = page.locator('a[href*="/bn/incidents/"]').first();

  if (await incidentLink.count() === 0) {
    test.skip(true, "No public incident is currently available for a read-only detail smoke test.");
  }

  await incidentLink.click();
  await expect(page).toHaveURL(/\/bn\/incidents\/RK-[A-Z0-9]+$/);
  await expect(page.locator("main")).toBeVisible();
});
