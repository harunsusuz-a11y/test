// Venti-Ate — indirim ve paket kurgusu (tek kaynak)
// NOT: Kuponlar DEMO'dur — gerçek kupon sistemi (Supabase coupons tablosu)
// bağlandığında bu liste kaldırılıp API'den doğrulanmalıdır.

export const FREE_SHIPPING_THRESHOLD = 300;
export const STANDARD_SHIPPING_COST = 29.9;

/** Bar + Krema paketi: sepette her iki kategoriden ürün varsa ikiliye uygulanan indirim */
export const BUNDLE_DISCOUNT_RATE = 0.1;
export const BUNDLE_NAME = "Bar + Krema Paketi";

export type DemoCoupon = {
  code: string;
  discountType: "percent";
  discountValue: number; // percent ise 0-100
  isDemo: true;
};

export const demoCoupons: DemoCoupon[] = [
  // Announcement bar'da duyurulan kod — demo olarak gerçekten çalışır
  { code: "VENTI10", discountType: "percent", discountValue: 10, isDemo: true },
];

export function findCoupon(code: string): DemoCoupon | null {
  const normalized = code.trim().toUpperCase();
  return demoCoupons.find((c) => c.code === normalized) ?? null;
}
