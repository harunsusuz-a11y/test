import type { DbProduct } from "@/lib/data/products";

/**
 * Ürün bazlı renk kimliği. Her ürün, marka paletinin (brandbook) içinden
 * kendi accent tonunu alır — palet dışına çıkılmaz:
 * - protein-bar (tiramisu): şeftali/karamel dünyası
 * - findik-kremasi: yeşil/taze dünya
 */
export type ProductTheme = {
  heroBg: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  strokeColor: string;
};

const DEFAULT_THEME: ProductTheme = {
  heroBg: "bg-brown-darker",
  accentText: "text-peach",
  accentBg: "bg-peach",
  accentBorder: "border-peach",
  strokeColor: "#F9C89E",
};

const THEMES: Record<string, ProductTheme> = {
  "protein-bar": DEFAULT_THEME,
  "findik-kremasi": {
    heroBg: "bg-brown-dark",
    accentText: "text-green-light",
    accentBg: "bg-green-light",
    accentBorder: "border-green-light",
    strokeColor: "#5C7A34",
  },
};

/**
 * Ürün kategorisine göre tema döner.
 * category null/undefined/tanımsız ise protein-bar teması (default) kullanılır.
 * Slug üzerinden de tahmin yapar (DB'de category kolonu boş olsa bile).
 */
export function getProductTheme(product: DbProduct | { category?: string | null; slug?: string }): ProductTheme {
  // 1. Direkt category eşleşmesi
  const cat = (product as any).category as string | null | undefined;
  if (cat && THEMES[cat]) return THEMES[cat];

  // 2. Slug'dan tahmin (DB'de category null ise)
  const slug = (product as any).slug as string | undefined;
  if (slug) {
    if (slug.includes("krema")) return THEMES["findik-kremasi"];
    if (slug.includes("bar") || slug.includes("tiramisu") || slug.includes("kakao")) return THEMES["protein-bar"];
  }

  // 3. Her koşulda güvenli fallback
  return DEFAULT_THEME;
}
