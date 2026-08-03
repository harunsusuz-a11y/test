import { test, expect } from "@playwright/test";

test.describe("Sepet", () => {
  test("ürün sepete ekleniyor", async ({ page }) => {
    await page.goto("/magaza");
    const addBtn = page.getByRole("button", { name: /Sepete Ekle/i }).first();
    await addBtn.click();
    // Sepet drawer açılmalı
    await expect(page.getByRole("dialog", { name: /Sepetim/i })).toBeVisible();
  });

  test("sepet drawer açılıp kapanıyor", async ({ page }) => {
    await page.goto("/");
    const cartBtn = page.getByRole("button", { name: /Sepetim/i });
    await cartBtn.click();
    const drawer = page.getByRole("dialog", { name: /Sepetim/i });
    await expect(drawer).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();
  });
});
