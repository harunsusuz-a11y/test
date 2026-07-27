"use client";

import Image from "next/image";
import { useState } from "react";
import { Plus } from "lucide-react";
import type { Product } from "@/content/products";
import type { ProductTheme } from "@/lib/utils/product-theme";

/**
 * Makro ürün görseli üzerinde tıklanabilir + noktaları.
 * İçerik uydurulmaz: her nokta content/products.ts'teki highlights
 * maddelerinden birini gösterir. Konumlar kategoriye göre sabittir.
 */
const POSITIONS = [
  { top: "28%", left: "22%" },
  { top: "48%", left: "68%" },
  { top: "72%", left: "38%" },
];

export function TextureHotspots({ product, theme }: { product: Product; theme: ProductTheme }) {
  const [active, setActive] = useState<number | null>(null);
  const spots = product.highlights.slice(0, POSITIONS.length);
  const image = product.gallery[product.gallery.length - 1] ?? product.image;

  if (spots.length === 0) return null;

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem]">
      <Image src={image} alt={`${product.name} yakın çekim`} fill sizes="(min-width: 768px) 60vw, 100vw" loading="lazy" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-brown-darker/30 to-transparent" />

      {spots.map((text, i) => {
        const open = active === i;
        return (
          <div key={text} className="absolute" style={POSITIONS[i]}>
            <button
              type="button"
              onClick={() => setActive(open ? null : i)}
              aria-expanded={open}
              aria-label={open ? "Detayı kapat" : `Detay ${i + 1}: göster`}
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-cream/80 text-brown-darker shadow-lg transition-all duration-300 hover:scale-110 ${theme.accentBg} ${
                open ? "rotate-45" : "motion-safe:animate-pulse"
              }`}
            >
              <Plus size={16} aria-hidden="true" />
            </button>
            {open && (
              <div
                role="tooltip"
                className="absolute left-1/2 top-full z-10 mt-3 w-56 -translate-x-1/2 rounded-2xl bg-cream p-4 text-xs font-medium leading-relaxed text-brown-darker shadow-xl shadow-brown-darker/25 motion-safe:animate-[popIn_.25s_ease-out]"
              >
                {text}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
