import { test, expect } from "@playwright/test";

test.describe("Ödeme", () => {
  test("boş sepette ödeme sayfası uyarı veriyor", async ({ page }) => {
    await page.goto("/odeme");
    await expect(page.getByText(/boş/i)).toBeVisible();
  });
});
