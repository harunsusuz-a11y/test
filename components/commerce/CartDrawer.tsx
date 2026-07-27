"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { Check, Minus, Plus, Truck, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { products } from "@/content/products";
import { formatPrice } from "@/lib/utils/format";

/** CheckoutForm ile aynı eşik: 300 TL ve üzeri standart kargo ücretsiz. */
const FREE_SHIPPING_THRESHOLD = 300;

/**
 * Sepete ekleme sonrası sağdan kayan mini sepet çekmecesi.
 * Popup değildir: kullanıcıyı sayfadan koparmadan eklenen ürünü,
 * ücretsiz kargo ilerlemesini ve tek bir çapraz satış önerisini gösterir.
 */
export function CartDrawer() {
  const { cartDrawerOpen, lastAddedSlug, closeCartDrawer } = useUiStore();
  const lines = useCartStore((s) => s.lines);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const addItem = useCartStore((s) => s.addItem);
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const panelRef = useRef<HTMLDivElement>(null);

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  // Tek çapraz satış önerisi: sepette olmayan ilk ürün
  const crossSell = useMemo(
    () => products.find((p) => !lines.some((l) => l.slug === p.slug)),
    [lines]
  );

  // Escape ile kapat + odak yönetimi
  useEffect(() => {
    if (!cartDrawerOpen) return;
    panelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCartDrawer();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartDrawerOpen, closeCartDrawer]);

  if (!cartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Sepet önizlemesi">
      <button
        type="button"
        aria-label="Sepet önizlemesini kapat"
        onClick={closeCartDrawer}
        className="absolute inset-0 bg-brown-darker/40 motion-safe:animate-[fadeIn_.25s_ease-out]"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-cream shadow-2xl shadow-brown-darker/30 outline-none motion-safe:animate-[slideInRight_.35s_cubic-bezier(.16,1,.3,1)]"
      >
        <div className="flex items-center justify-between border-b border-brown/10 px-6 py-5">
          <p className="flex items-center gap-2 font-display text-lg font-bold text-brown-darker">
            <Check size={18} className="text-green" aria-hidden="true" />
            Sepete eklendi
          </p>
          <button
            type="button"
            onClick={closeCartDrawer}
            aria-label="Kapat"
            className="rounded-full p-2 text-brown-dark/60 transition hover:bg-brown/5 hover:text-brown-darker"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Ücretsiz kargo ilerlemesi */}
        <div className="border-b border-brown/10 px-6 py-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-brown-dark/80">
            <Truck size={14} className="text-green" aria-hidden="true" />
            {remaining > 0
              ? `Ücretsiz kargoya ${formatPrice(remaining)} kaldı`
              : "Kargon ücretsiz 🎉"}
          </p>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-brown/10"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Ücretsiz kargo ilerlemesi"
          >
            <div
              className="h-full rounded-full bg-green transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Satırlar */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lines.length === 0 ? (
            <p className="py-10 text-center text-sm text-brown-dark/60">Sepetin boş.</p>
          ) : (
            <ul className="space-y-4">
              {lines.map((line) => (
                <li
                  key={line.slug}
                  className={`flex gap-4 rounded-2xl border p-3 transition ${
                    line.slug === lastAddedSlug ? "border-green/40 bg-green/5" : "border-brown/10 bg-white/60"
                  }`}
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brown/5">
                    <Image src={line.image} alt={line.name} fill sizes="4rem" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="text-sm font-semibold text-brown-darker">{line.name}</p>
                    <p className="mt-0.5 text-xs text-brown-dark/60">{formatPrice(line.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`${line.name} adedini azalt`}
                        onClick={() => updateQuantity(line.slug, line.quantity - 1)}
                        className="rounded-full border border-brown/20 p-1.5 transition hover:border-brown/40"
                      >
                        <Minus size={12} aria-hidden="true" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold" aria-live="polite">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`${line.name} adedini artır`}
                        onClick={() => updateQuantity(line.slug, line.quantity + 1)}
                        className="rounded-full border border-brown/20 p-1.5 transition hover:border-brown/40"
                      >
                        <Plus size={12} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Tek çapraz satış */}
          {crossSell && (
            <div className="mt-6 rounded-2xl border border-dashed border-brown/20 p-4">
              <p className="text-[11px] font-bold uppercase tracking-widest2 text-green">Bununla iyi gider</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brown/5">
                  <Image src={crossSell.image} alt={crossSell.name} fill sizes="3.5rem" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brown-darker">{crossSell.name}</p>
                  <p className="text-xs text-brown-dark/60">{formatPrice(crossSell.price)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => addItem(crossSell)}
                  aria-label={`${crossSell.name} ürününü sepete ekle`}
                  className="rounded-full bg-brown-darker p-2.5 text-cream transition hover:bg-green"
                >
                  <Plus size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Alt aksiyonlar */}
        <div className="border-t border-brown/10 px-6 py-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-brown-dark/70">Ara toplam</span>
            <span className="font-display text-lg font-bold text-brown-darker">{formatPrice(subtotal)}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link
              href="/sepet"
              onClick={closeCartDrawer}
              className="rounded-full border border-brown/20 py-3 text-center text-sm font-bold text-brown-darker transition hover:border-brown/40"
            >
              Sepete Git
            </Link>
            <Link
              href="/odeme"
              onClick={closeCartDrawer}
              className="rounded-full bg-brown-darker py-3 text-center text-sm font-bold text-cream transition hover:bg-green"
            >
              Ödemeye Geç
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
