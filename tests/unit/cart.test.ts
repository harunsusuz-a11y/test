import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/store/cart-store";
import { products } from "@/content/products";

const bar = products[0];
const cream = products[1];

describe("cart-store", () => {
  beforeEach(() => {
    useCartStore.getState().clear();
  });

  it("boş sepette sayaç ve toplam sıfırdır", () => {
    expect(useCartStore.getState().count()).toBe(0);
    expect(useCartStore.getState().subtotal()).toBe(0);
  });

  it("ürün eklendiğinde satır oluşturur", () => {
    useCartStore.getState().addItem(bar);
    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useCartStore.getState().count()).toBe(1);
  });

  it("aynı ürün tekrar eklendiğinde adedi artırır, yeni satır açmaz", () => {
    useCartStore.getState().addItem(bar);
    useCartStore.getState().addItem(bar, 2);
    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useCartStore.getState().lines[0].quantity).toBe(3);
  });

  it("sepet toplamını doğru hesaplar", () => {
    useCartStore.getState().addItem(bar, 2); // 2 x 39.9
    useCartStore.getState().addItem(cream, 1); // 1 x 149.9
    expect(useCartStore.getState().subtotal()).toBeCloseTo(2 * 39.9 + 149.9, 2);
  });

  it("updateQuantity sıfır veya altına çekildiğinde ürünü kaldırır", () => {
    useCartStore.getState().addItem(bar);
    useCartStore.getState().updateQuantity(bar.slug, 0);
    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  it("removeItem doğru ürünü sepetten kaldırır", () => {
    useCartStore.getState().addItem(bar);
    useCartStore.getState().addItem(cream);
    useCartStore.getState().removeItem(bar.slug);
    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useCartStore.getState().lines[0].slug).toBe(cream.slug);
  });
});
