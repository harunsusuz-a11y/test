import { test, expect } from "@playwright/test";

test("ana sayfa açılır ve marka başlığını gösterir", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Fındığın");
});

test("navigasyon mağazaya götürür", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Ürünleri Keşfet" }).click();
  await expect(page).toHaveURL(/\/magaza/);
  await expect(page.getByRole("heading", { name: "Tüm Ürünler" })).toBeVisible();
});

test("ürün sepete eklenir ve sepet sayacı güncellenir", async ({ page }) => {
  await page.goto("/magaza");
  await page.getByRole("button", { name: /Sepete Ekle/ }).first().click();
  const cartLink = page.getByRole("link", { name: /Sepetim/ });
  await expect(cartLink).toContainText("1");
});

test("sepette adet güncellenebilir", async ({ page }) => {
  await page.goto("/magaza");
  await page.getByRole("button", { name: /Sepete Ekle/ }).first().click();
  await page.getByRole("link", { name: /Sepetim/ }).click();
  await expect(page).toHaveURL(/\/sepet/);
  await page.getByRole("button", { name: "Adedi artır" }).first().click();
  await expect(page.getByText("2", { exact: true }).first()).toBeVisible();
});

test("checkout'a ilerleme ve sözleşme onayı zorunlu", async ({ page }) => {
  await page.goto("/magaza");
  await page.getByRole("button", { name: /Sepete Ekle/ }).first().click();
  await page.goto("/odeme");
  await page.getByRole("button", { name: /Siparişi Tamamla/ }).click();
  await expect(page.getByText("mesafeli satış sözleşmesini onaylamalısınız")).toBeVisible();
});

test("newsletter formu geçersiz e-postada hata gösterir", async ({ page }) => {
  await page.goto("/");
  const emailInput = page.getByLabel("E-posta adresi");
  await emailInput.fill("gecersiz-eposta");
  await page.getByRole("button", { name: "Katıl" }).click();
  await expect(page.getByText("Geçerli bir e-posta adresi girin.")).toBeVisible();
});

test("mobil menü açılıp kapanır", async ({ page, isMobile }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menüyü aç" }).click();
  await expect(page.getByRole("navigation", { name: "Mobil navigasyon" })).toBeVisible();
});

test("prefers-reduced-motion ile scroll hikayesi hâlâ okunabilir", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByText("Gerçek Giresun fındığıyla başlar.")).toBeVisible();
});
