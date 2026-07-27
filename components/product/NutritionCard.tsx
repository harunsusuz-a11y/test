"use client";

import { useEffect, useRef, useState } from "react";
import { Sprout } from "lucide-react";
import type { Product } from "@/content/products";
import type { ProductTheme } from "@/lib/utils/product-theme";

/**
 * Besin değerleri "etiket kartı": sayısal değerler için görünür olunca dolan
 * yatay barlar (Protein/Karbonhidrat/Yağ vb.), sayısal olmayanlar düz satır.
 * İçindekiler chip/rozet dizisi olarak yanında durur.
 * Değerler content/products.ts'ten aynen gelir — yeniden hesaplanmaz/uydurulmaz.
 */
function parseGrams(value: string): number | null {
  // "~12 g", "8,5 g" gibi değerlerden sayıyı çek; kcal gibi birimler bar'a girmez
  if (!/g\s*$/.test(value.trim())) return null;
  const m = value.replace(",", ".").match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : null;
}

export function NutritionCard({ product, theme }: { product: Product; theme: ProductTheme }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  const rows = product.nutritionPer100g.map((row) => ({ ...row, grams: parseGrams(row.value) }));
  const maxGrams = Math.max(...rows.map((r) => r.grams ?? 0), 1);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="grid gap-10 md:grid-cols-2">
      {/* Etiket kartı */}
      <div ref={ref} className="rounded-3xl border border-brown/10 bg-white/60 p-7 shadow-sm">
        <div className="flex items-baseline justify-between border-b-2 border-brown-darker pb-3">
          <h3 className="font-display text-xl font-extrabold text-brown-darker">Besin Değerleri</h3>
          <span className="text-xs font-semibold text-brown-dark/50">100g için</span>
        </div>
        <dl className="mt-4 space-y-4">
          {rows.map((row) => (
            <div key={row.label}>
              <div className="flex items-center justify-between text-sm">
                <dt className="font-medium text-brown-dark/70">{row.label}</dt>
                <dd className="font-bold text-brown-darker">{row.value}</dd>
              </div>
              {row.grams !== null && (
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-brown/10">
                  <div
                    className={`h-full rounded-full ${theme.accentBg} transition-all duration-1000 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none`}
                    style={{ width: shown ? `${(row.grams / maxGrams) * 100}%` : "0%" }}
                  />
                </div>
              )}
            </div>
          ))}
        </dl>
        <p className="mt-5 text-xs text-brown-dark/45">
          Bu değerler ön formülasyona dayanır; kesin besin değerleri resmi ürün etiketiyle netleşecektir.
        </p>
      </div>

      {/* İçindekiler chip'leri */}
      <div>
        <h3 className="font-display text-xl font-extrabold text-brown-darker">İçindekiler</h3>
        <ul className="mt-4 flex flex-wrap gap-2.5">
          {product.ingredients.map((ing) => (
            <li
              key={ing}
              className="flex items-center gap-2 rounded-full border border-brown/15 bg-white/60 px-4 py-2 text-sm text-brown-dark/85 transition-colors hover:border-green/40 hover:bg-green/5"
            >
              <Sprout size={13} className="text-green" aria-hidden="true" />
              {ing}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs text-brown-dark/45">
          İçindekiler listesi ve alerjen bilgisi ürün etiketi resmi olarak onaylanınca güncellenecektir.
        </p>
      </div>
    </div>
  );
}
