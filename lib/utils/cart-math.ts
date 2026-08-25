import type { CartLine } from "@/store/cart-store";

export const BUNDLE_DISCOUNT_RATE = 0.1;

/**
 * Kargo ayarlarını DB'den çeker. Client componentlerde çağrılacak.
 * Hata durumunda hardcode fallback döner.
 */
export async function fetchShippingSettings(): Promise<{
  free_shipping_threshold: number;
  standard_shipping_cost: number;
}> {
  try {
    const res = await fetch("/api/settings/shipping", { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    return { free_shipping_threshold: 300, standard_shipping_cost: 29.9 };
  }
}

/**
 * Kupon kodunu DB'den doğrular.
 */
export async function validateCoupon(
  code: string,
  order_amount: number
): Promise<{
  valid: boolean;
  error?: string;
  discount_type?: "percent" | "fixed";
  discount_value?: number;
  max_discount?: number | null;
}> {
  try {
    const res = await fetch("/api/coupon/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, order_amount }),
    });
    return res.json();
  } catch {
    return { valid: false, error: "Bağlantı hatası" };
  }
}

export type CartTotals = {
  subtotal: number;
  bundleDiscount: number;
  bundleEligible: boolean;
  bundleMissingCategory: "protein-bar" | "findik-kremasi" | null;
  couponDiscount: number;
  couponValid: boolean;
  discountedSubtotal: number;
  shippingCost: number;
  freeShipping: boolean;
  remainingForFreeShipping: number;
  total: number;
};

/**
 * Sync hesaplama — CartDrawer ve sepet sayfasında kullanılır.
 * Kargo eşiği ve kupon indirimi dışarıdan geçirilir (async fetch sonrası).
 */
export function computeCartTotals(
  lines: CartLine[],
  options: {
    couponDiscount?: number;
    couponValid?: boolean;
    freeShippingThreshold?: number;
    standardShippingCost?: number;
    /** ürün kategori bilgisi: slug → category slug */
    categoryMap?: Record<string, string>;
  } = {}
): CartTotals {
  const {
    couponDiscount = 0,
    couponValid = false,
    freeShippingThreshold = 300,
    standardShippingCost = 29.9,
    categoryMap = {},
  } = options;

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  const barPrices: number[] = [];
  const creamPrices: number[] = [];
  for (const line of lines) {
    const cat = categoryMap[line.slug];
    if (cat === "protein-bar") barPrices.push(line.price);
    if (cat === "findik-kremasi") creamPrices.push(line.price);
  }

  const bundleEligible = barPrices.length > 0 && creamPrices.length > 0;
  const bundleDiscount = bundleEligible
    ? (Math.min(...barPrices) + Math.min(...creamPrices)) * BUNDLE_DISCOUNT_RATE
    : 0;
  const bundleMissingCategory =
    lines.length === 0 || bundleEligible
      ? null
      : barPrices.length === 0
        ? "protein-bar"
        : "findik-kremasi";

  const afterBundle = subtotal - bundleDiscount;
  const discountedSubtotal = Math.max(0, afterBundle - couponDiscount);
  const freeShipping = discountedSubtotal >= freeShippingThreshold;
  const shippingCost = lines.length === 0 || freeShipping ? 0 : standardShippingCost;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - discountedSubtotal);

  return {
    subtotal,
    bundleDiscount,
    bundleEligible,
    bundleMissingCategory,
    couponDiscount,
    couponValid,
    discountedSubtotal,
    shippingCost,
    freeShipping,
    remainingForFreeShipping,
    total: discountedSubtotal + shippingCost,
  };
}
