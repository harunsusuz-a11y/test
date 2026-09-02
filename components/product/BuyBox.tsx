"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import type { Product } from "@/content/products";
import type { ProductTheme } from "@/lib/utils/product-theme";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { formatPrice } from "@/lib/utils/format";

export function BuyBox({ product, theme }: { product: Product; theme: ProductTheme }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [panelVisible, setPanelVisible] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);

  const total = product.price * quantity;

  function handleAdd() {
    addItem(product, quantity);
    openCartDrawer(product.slug);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setPanelVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={panelRef} className="card-solid mt-8 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-lg border border-brown/20 bg-white">
            <button type="button" aria-label="Adedi azalt" className="flex h-11 w-11 items-center justify-center" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-bold" aria-live="polite">
              {quantity}
            </span>
            <button type="button" aria-label="Adedi artır" className="flex h-11 w-11 items-center justify-center" onClick={() => setQuantity((q) => q + 1)}>
              <Plus size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="btn-signature flex flex-1 items-center justify-center gap-2 bg-brown-darker px-8 py-4 text-sm font-bold text-cream transition hover:bg-green active:scale-[0.98]"
          >
            <ShoppingBag size={15} aria-hidden="true" />
            {added ? "Sepete eklendi ✓" : `Sepete Ekle — ${formatPrice(total)}`}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-brown/10 pt-4 text-xs text-brown-dark/70">
          <span className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-green" aria-hidden="true" />
            Stokta var <span className="text-brown-dark/40">(demo veri)</span>
          </span>
          <span className="flex items-center gap-2">
            <Truck size={14} className="text-green" aria-hidden="true" />
            300₺ üzeri ücretsiz kargo · 2-4 iş günü <span className="text-brown-dark/40">(demo veri)</span>
          </span>
        </div>
      </div>

      {/* Mobil sabit alt bar */}
      {!panelVisible && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-brown/10 bg-cream/95 px-4 py-3 backdrop-blur-md sm:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-brown-darker">{product.name}</p>
            <p className="text-xs text-brown-dark/60">{formatPrice(product.price * quantity)}</p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className={`btn-signature shrink-0 px-5 py-2 text-xs font-bold text-brown-darker transition hover:brightness-95 active:scale-[0.98] ${theme.accentBg}`}
          >
            {added ? "Eklendi ✓" : "Sepete Ekle"}
          </button>
        </div>
      )}
    </>
  );
}
