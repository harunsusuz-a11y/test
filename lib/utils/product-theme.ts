import type { Product } from "@/content/products";

/**
 * Ürün bazlı renk kimliği. Her ürün, marka paletinin (brandbook) içinden
 * kendi accent tonunu alır — palet dışına çıkılmaz:
 * - protein-bar (tiramisu): şeftali/karamel dünyası
 * - findik-kremasi: yeşil/taze dünya
 * Yeni kategori eklenirse buraya bir satır eklemek yeterli.
 */
export type ProductTheme = {
  /** Hero ve koyu bölümlerin zemini */
  heroBg: string;
  /** Vurgu rengi (eyebrow, halkalar, rozetler) — Tailwind class parçası */
  accentText: string;
  accentBg: string;
  accentBorder: string;
  /** Hero'daki dev tipografinin stroke rengi (CSS değeri) */
  strokeColor: string;
};

const THEMES: Record<Product["category"], ProductTheme> = {
  "protein-bar": {
    heroBg: "bg-brown-darker",
    accentText: "text-peach",
    accentBg: "bg-peach",
    accentBorder: "border-peach",
    strokeColor: "#F9C89E",
  },
  "findik-kremasi": {
    heroBg: "bg-brown-dark",
    accentText: "text-green-light",
    accentBg: "bg-green-light",
    accentBorder: "border-green-light",
    strokeColor: "#5C7A34",
  },
};

export function getProductTheme(product: Product): ProductTheme {
  return THEMES[product.category];
}
