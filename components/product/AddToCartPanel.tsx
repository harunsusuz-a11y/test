"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { Product } from "@/content/products";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils/format";

export function AddToCartPanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  function handleAdd() {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mt-8">
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
          className="flex-1 rounded-full bg-brown px-7 py-3.5 text-sm font-bold text-cream transition hover:bg-green"
        >
          {added ? "Sepete eklendi ✓" : `Sepete Ekle — ${formatPrice(product.price * quantity)}`}
        </button>
      </div>
      <p className="mt-3 text-xs text-brown-dark/60">
        Stok durumu: <span className="font-semibold text-green">Stokta var</span> (demo veri) · Tahmini kargo: 2-4 iş
        günü (demo veri)
      </p>
    </div>
  );
}
