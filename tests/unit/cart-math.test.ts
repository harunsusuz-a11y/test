import { describe, expect, it } from "vitest";
import { computeCartTotals } from "@/lib/utils/cart-math";
import { products } from "@/content/products";
import type { CartLine } from "@/store/cart-store";

const bar = products.find((p) => p.category === "protein-bar")!;
const cream = products.find((p) => p.category === "findik-kremasi")!;

function line(product: typeof bar, quantity = 1): CartLine {
  return { slug: product.slug, name: product.name, price: product.price, image: product.image, quantity };
}

describe("computeCartTotals", () => {
  it("boş sepette her şey sıfırdır", () => {
    const t = computeCartTotals([], null);
    expect(t.subtotal).toBe(0);
    expect(t.total).toBe(0);
    expect(t.shippingCost).toBe(0);
    expect(t.bundleMissingCategory).toBeNull();
  });

  it("tek kategoride paket uygulanmaz ve eksik kategori bildirilir", () => {
    const t = computeCartTotals([line(bar, 2)], null);
    expect(t.bundleEligible).toBe(false);
    expect(t.bundleDiscount).toBe(0);
    expect(t.bundleMissingCategory).toBe("findik-kremasi");
  });

  it("bar + krema birlikteyken paket indirimi ikiliye %10 uygulanır", () => {
    const t = computeCartTotals([line(bar), line(cream)], null);
    expect(t.bundleEligible).toBe(true);
    expect(t.bundleDiscount).toBeCloseTo((bar.price + cream.price) * 0.1, 2);
  });

  it("geçerli kupon paket sonrası tutara uygulanır", () => {
    const t = computeCartTotals([line(bar), line(cream)], "VENTI10");
    const afterBundle = t.subtotal - t.bundleDiscount;
    expect(t.couponValid).toBe(true);
    expect(t.couponDiscount).toBeCloseTo(afterBundle * 0.1, 2);
  });

  it("geçersiz kupon indirim yaratmaz", () => {
    const t = computeCartTotals([line(bar)], "OLMAYANKOD");
    expect(t.couponValid).toBe(false);
    expect(t.couponDiscount).toBe(0);
  });

  it("indirimli tutar eşiği geçince kargo ücretsizdir", () => {
    const t = computeCartTotals([line(cream, 3)], null); // 3 × 149.9 > 300
    expect(t.freeShipping).toBe(true);
    expect(t.shippingCost).toBe(0);
  });

  it("eşiğin altında standart kargo eklenir ve toplam tutarlıdır", () => {
    const t = computeCartTotals([line(bar)], null);
    expect(t.freeShipping).toBe(false);
    expect(t.total).toBeCloseTo(t.discountedSubtotal + t.shippingCost, 2);
  });
});
