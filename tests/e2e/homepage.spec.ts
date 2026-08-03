import { test, expect } from "@playwright/test";

test.describe("Ana sayfa", () => {
  test("yükleniyor ve hero görünüyor", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Venti-Ate/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("navigasyon linkleri çalışıyor", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Mağaza/i }).first().click();
    await expect(page).toHaveURL(/magaza/);
  });

  test("footer görünüyor", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toBeVisible();
  });
});
