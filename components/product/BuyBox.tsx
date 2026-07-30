"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Minus, Plus, RefreshCw, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import type { Product } from "@/content/products";
import type { ProductTheme } from "@/lib/utils/product-theme";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { formatPrice } from "@/lib/utils/format";

/** Abonelik sayfasındaki oranla aynı: abonelikte %10 indirim. */
const SUBSCRIPTION_DISCOUNT = 0.1;

/**
 * PDP satın alma modülü (AddToCartPanel'in yerini alır):
 * cam efektli kart içinde adet seçimi + "Tek seferlik / Abonelik" toggle'ı.
 * Abonelik seçilince indirimli fiyat gösterilir ve CTA abonelik akışına götürür —
 * sepete "sahte abonelik" satırı eklenmez; gerçek akış /abonelik sayfasındadır.
 */
export function BuyBox({ product, theme }: { product: Product; theme: ProductTheme }) {
  const [quantity, setQuantity] = useState(1);
  const [mode, setMode] = useState<"once" | "subscribe">("once");
  const [added, setAdded] = useState(false);
  const [panelVisible, setPanelVisible] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);

  const unitPrice = mode === "subscribe" ? product.price * (1 - SUBSCRIPTION_DISCOUNT) : product.price;
  const total = unitPrice * quantity;

  function handleAdd() {
    addItem(product, quantity);
    openCartDrawer(product.slug);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  // Ana modül ekrandan çıktığında mobilde sabit alt bar belirir
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
        {/* Satın alma tipi toggle'ı */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-brown/5 p-2" role="radiogroup" aria-label="Satın alma tipi">
          <button
            type="button"
            role="radio"
            aria-checked={mode === "once"}
            onClick={() => setMode("once")}
            className={`rounded-xl px-4 py-3 text-left transition-all duration-300 ${
              mode === "once" ? "bg-white shadow-sm" : "opacity-60 hover:opacity-100"
            }`}
          >
            <span className="block text-sm font-bold text-brown-darker">Tek Seferlik</span>
            <span className="mt-0.5 block text-xs text-brown-dark/60">{formatPrice(product.price)}</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={mode === "subscribe"}
            onClick={() => setMode("subscribe")}
            className={`relative rounded-xl px-4 py-3 text-left transition-all duration-300 ${
              mode === "subscribe" ? "bg-white shadow-sm" : "opacity-60 hover:opacity-100"
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-bold text-brown-darker">
              <RefreshCw size={13} className="text-green" aria-hidden="true" />
              Abonelik
            </span>
            <span className="mt-0.5 block text-xs text-brown-dark/60">
              {formatPrice(product.price * (1 - SUBSCRIPTION_DISCOUNT))}{" "}
              <span className="font-bold text-green">%10 indirimli</span>
            </span>
          </button>
        </div>

        <div className="mt-5 flex items-center gap-4">
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

          {mode === "once" ? (
            <button
              type="button"
              onClick={handleAdd}
              className="btn-signature flex flex-1 items-center justify-center gap-2 bg-brown-darker px-8 py-4 text-sm font-bold text-cream transition hover:bg-green active:scale-[0.98]"
            >
              <ShoppingBag size={15} aria-hidden="true" />
              {added ? "Sepete eklendi ✓" : `Sepete Ekle — ${formatPrice(total)}`}
            </button>
          ) : (
            <Link
              href="/abonelik"
              className="btn-signature flex flex-1 items-center justify-center gap-2 bg-green px-8 py-4 text-sm font-bold text-cream transition hover:bg-brown-darker active:scale-[0.98]"
            >
              <RefreshCw size={15} aria-hidden="true" />
              Aboneliği Başlat — {formatPrice(total)}
            </Link>
          )}
        </div>

        {mode === "subscribe" && (
          <p className="mt-3 text-xs text-brown-dark/60">
            Sıklığı (haftalık / 2 haftada bir / aylık) bir sonraki adımda seçeceksin. İstediğin zaman durdurabilirsin.
          </p>
        )}

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
            className={`btn-signature shrink-0 px-5 py-2 text-xs font-bold text-brown-darker transition hover:brightness-95 ${theme.accentBg}`}
          >
            {added ? "Eklendi ✓" : "Sepete Ekle"}
          </button>
        </div>
      )}
    </>
  );
}
