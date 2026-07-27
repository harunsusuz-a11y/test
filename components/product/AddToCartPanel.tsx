"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Truck, ShieldCheck } from "lucide-react";
import type { Product } from "@/content/products";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils/format";

export function AddToCartPanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [panelVisible, setPanelVisible] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);

  function handleAdd() {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  // Ana panel ekrandan çıktığında mobilde sabit alt bar gösterilir
  // (dönüşüm oranını artıran standart e-ticaret deseni).
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setPanelVisible(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={panelRef} className="mt-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-full border border-brown/20">
            <button
              type="button"
              aria-label="Adedi azalt"
              className="p-3"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-bold" aria-live="polite">
              {quantity}
            </span>
            <button type="button" aria-label="Adedi artır" className="p-3" onClick={() => setQuantity((q) => q + 1)}>
              <Plus size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 rounded-full bg-brown px-7 py-3.5 text-sm font-bold text-cream transition hover:scale-[1.02] hover:bg-green active:scale-95"
          >
            {added ? "Sepete eklendi ✓" : `Sepete Ekle — ${formatPrice(product.price * quantity)}`}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-brown-dark/70">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-green" aria-hidden="true" />
            Stokta var <span className="text-brown-dark/40">(demo veri)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Truck size={14} className="text-green" aria-hidden="true" />
            Tahmini kargo: 2-4 iş günü <span className="text-brown-dark/40">(demo veri)</span>
          </span>
        </div>
      </div>

      {/* Mobil sabit alt bar — ana panel görünür olmadığında belirir */}
      {!panelVisible && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-brown/10 bg-cream/95 px-4 py-3 backdrop-blur-md sm:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-brown-darker">{product.name}</p>
            <p className="text-xs text-brown-dark/60">{formatPrice(product.price * quantity)}</p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="shrink-0 rounded-full bg-brown px-5 py-2.5 text-xs font-bold text-cream transition hover:bg-green"
          >
            {added ? "Eklendi ✓" : "Sepete Ekle"}
          </button>
        </div>
      )}
    </>
  );
}
