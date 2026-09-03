import { test, expect } from "@playwright/test";

test("public navigation and information pages render", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main")).toBeVisible();

  await page.goto("/incidents");
  await expect(page).toHaveURL(/\/incidents$/);

  for (const path of ["about", "how-it-works", "privacy", "content-policy", "security", "terms"]) {
    await page.goto(`/${path}`);
    await expect(page.locator("main")).toBeVisible();
  }
});

test("report form renders its required controls", async ({ page }) => {
  await page.goto("/incident/new");
  await expect(page.getByLabel(/title/i)).toBeVisible();
  await expect(page.getByLabel(/description/i)).toBeVisible();
  await expect(page.getByLabel(/category/i)).toBeVisible();
  await expect(page.getByLabel(/division/i)).toBeVisible();
  await expect(page.getByLabel(/district/i)).toBeVisible();
});

test("public incident detail route renders", async ({ page }) => {
  await page.goto("/incidents");
  const incidentLink = page.locator('a[href*="/incidents/RK-"]').first();

  if (await incidentLink.count() === 0) {
    test.skip(true, "No public incident is currently available for a read-only detail smoke test.");
  }

  await incidentLink.click();
  await expect(page).toHaveURL(/\/incidents\/RK-[A-Z0-9]+$/);
  await expect(page.locator("main")).toBeVisible();
});
