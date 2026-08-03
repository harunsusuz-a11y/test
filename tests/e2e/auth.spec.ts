import { test, expect } from "@playwright/test";

test.describe("Auth", () => {
  test("üye girişi sayfası açılıyor", async ({ page }) => {
    await page.goto("/uye-giris");
    await expect(page.getByRole("heading", { name: /Giriş Yap/i })).toBeVisible();
  });

  test("geçersiz giriş hata veriyor", async ({ page }) => {
    await page.goto("/uye-giris");
    await page.fill('input[type="email"]', "yanlis@test.com");
    await page.fill('input[type="password"]', "yanlis123");
    await page.getByRole("button", { name: /Giriş Yap/i }).click();
    await expect(page.getByText(/hatalı/i)).toBeVisible({ timeout: 5000 });
  });

  test("korumalı sayfalar yönlendiriyor", async ({ page }) => {
    await page.goto("/hesabim");
    await expect(page).toHaveURL(/uye-giris/, { timeout: 5000 });
  });
});
