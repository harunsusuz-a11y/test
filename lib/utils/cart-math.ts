import type { CartLine } from "@/store/cart-store";
import { getProductBySlug } from "@/content/products";
import {
  BUNDLE_DISCOUNT_RATE,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_COST,
  findCoupon,
} from "@/content/discounts";

/**
 * Sepet matematiğinin tek kaynağı. Drawer, /sepet sayfası ve ödeme özeti
 * hepsi bunu kullanır — üç yerde üç farklı toplam çıkması imkânsız hale gelir.
 *
 * Kurgu sırası:
 * 1) Ara toplam
 * 2) Paket indirimi: sepette hem protein bar hem krema varsa, en ucuz
 *    bar + en ucuz krema ikilisine %10 (otomatik, kupon gerektirmez)
 * 3) Kupon: paket sonrası tutara uygulanır (demo kuponlar)
 * 4) Kargo: indirimli tutar eşiği geçtiyse ücretsiz
 */
export type CartTotals = {
  subtotal: number;
  bundleDiscount: number;
  bundleEligible: boolean; // paket şu an uygulanıyor mu
  /** Pakete bir kategori eksikse: hangi kategori eklenirse paket açılır */
  bundleMissingCategory: "protein-bar" | "findik-kremasi" | null;
  couponDiscount: number;
  couponValid: boolean;
  discountedSubtotal: number;
  shippingCost: number;
  freeShipping: boolean;
  remainingForFreeShipping: number;
  total: number;
};

export function computeCartTotals(lines: CartLine[], couponCode: string | null): CartTotals {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  // Kategoriler slug üzerinden ürün verisinden çözülür (persist edilmiş eski
  // sepet satırlarında kategori alanı olmayabilir).
  const barPrices: number[] = [];
  const creamPrices: number[] = [];
  for (const line of lines) {
    const product = getProductBySlug(line.slug);
    if (!product) continue;
    if (product.category === "protein-bar") barPrices.push(line.price);
    if (product.category === "findik-kremasi") creamPrices.push(line.price);
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

  const coupon = couponCode ? findCoupon(couponCode) : null;
  const couponDiscount = coupon ? afterBundle * (coupon.discountValue / 100) : 0;

  const discountedSubtotal = Math.max(0, afterBundle - couponDiscount);
  const freeShipping = discountedSubtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = lines.length === 0 || freeShipping ? 0 : STANDARD_SHIPPING_COST;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - discountedSubtotal);

  return {
    subtotal,
    bundleDiscount,
    bundleEligible,
    bundleMissingCategory,
    couponDiscount,
    couponValid: !!coupon,
    discountedSubtotal,
    shippingCost,
    freeShipping,
    remainingForFreeShipping,
    total: discountedSubtotal + shippingCost,
  };
}
