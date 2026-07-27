"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BadgePercent, Check, Gift, Minus, Plus, Trash2, Truck, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { products, getProductBySlug } from "@/content/products";
import { formatPrice } from "@/lib/utils/format";
import { computeCartTotals } from "@/lib/utils/cart-math";
import { BUNDLE_NAME } from "@/content/discounts";

/**
 * Tam sepet deneyimi — artık ayrı sayfaya gitmeden her şey burada:
 * satırlar, adet/silme, otomatik Bar+Krema paket indirimi, kupon kodu,
 * ücretsiz kargo ilerlemesi, özet ve ödeme CTA'sı.
 * Header'daki "Sepetim" ve sepete ekleme bu çekmeceyi açar; /sepet sayfası
 * derin link/paylaşım için durur.
 */
export function CartDrawer() {
  const { cartDrawerOpen, lastAddedSlug, closeCartDrawer } = useUiStore();
  const lines = useCartStore((s) => s.lines);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const addItem = useCartStore((s) => s.addItem);
  const couponCode = useCartStore((s) => s.couponCode);
  const setCoupon = useCartStore((s) => s.setCoupon);

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const totals = computeCartTotals(lines, couponCode);
  const progress = Math.min(
    100,
    (totals.discountedSubtotal / (totals.discountedSubtotal + totals.remainingForFreeShipping || 1)) * 100
  );

  // Paket tamamlama önerisi: eksik kategoriden en uygun ürün
  const bundleSuggestion = useMemo(() => {
    if (!totals.bundleMissingCategory) return null;
    return products.find((p) => p.category === totals.bundleMissingCategory) ?? null;
  }, [totals.bundleMissingCategory]);

  function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    const trial = couponInput.trim().toUpperCase();
    if (!trial) return;
    const trialTotals = computeCartTotals(lines, trial);
    if (trialTotals.couponValid) {
      setCoupon(trial);
      setCouponError(false);
      setCouponInput("");
    } else {
      setCouponError(true);
    }
  }

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
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Sepetim">
      <button
        type="button"
        aria-label="Sepeti kapat"
        onClick={closeCartDrawer}
        className="absolute inset-0 bg-brown-darker/40 motion-safe:animate-[fadeIn_.25s_ease-out]"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl shadow-brown-darker/30 outline-none motion-safe:animate-[slideInRight_.35s_cubic-bezier(.16,1,.3,1)]"
      >
        {/* Başlık */}
        <div className="flex items-center justify-between border-b border-brown/10 px-6 py-5">
          <p className="font-display text-xl font-extrabold text-brown-darker">
            Sepetim{" "}
            {lines.length > 0 && (
              <span className="text-sm font-semibold text-brown-dark/50">
                ({lines.reduce((n, l) => n + l.quantity, 0)} ürün)
              </span>
            )}
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

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-display text-xl font-bold text-brown-darker">Sepetin boş.</p>
            <p className="text-sm text-brown-dark/60">İlk ısırık bir tık uzağında.</p>
            <Link
              href="/magaza"
              onClick={closeCartDrawer}
              className="rounded-full bg-brown-darker px-7 py-3 text-sm font-bold text-cream transition hover:bg-green"
            >
              Mağazaya Git
            </Link>
          </div>
        ) : (
          <>
            {/* Ücretsiz kargo ilerlemesi */}
            <div className="border-b border-brown/10 px-6 py-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-brown-dark/80">
                <Truck size={14} className="text-green" aria-hidden="true" />
                {totals.freeShipping
                  ? "Kargon ücretsiz 🎉"
                  : `Ücretsiz kargoya ${formatPrice(totals.remainingForFreeShipping)} kaldı`}
              </p>
              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-brown/10"
                role="progressbar"
                aria-valuenow={Math.round(totals.freeShipping ? 100 : progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Ücretsiz kargo ilerlemesi"
              >
                <div
                  className="h-full rounded-full bg-green transition-all duration-500"
                  style={{ width: `${totals.freeShipping ? 100 : progress}%` }}
                />
              </div>
            </div>

            {/* Satırlar */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="space-y-4">
                {lines.map((line) => {
                  const product = getProductBySlug(line.slug);
                  return (
                    <li
                      key={line.slug}
                      className={`flex gap-4 rounded-2xl border p-3 transition ${
                        line.slug === lastAddedSlug ? "border-green/40 bg-green/5" : "border-brown/10 bg-white/60"
                      }`}
                    >
                      <Link
                        href={`/urun/${line.slug}`}
                        onClick={closeCartDrawer}
                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brown/5"
                      >
                        <Image src={line.image} alt={line.name} fill sizes="5rem" className="object-cover" />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-brown-darker">{line.name}</p>
                            {product && (
                              <p className="text-[11px] uppercase tracking-wide text-brown-dark/50">{product.flavor}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            aria-label={`${line.name} ürününü sepetten kaldır`}
                            onClick={() => removeItem(line.slug)}
                            className="rounded-full p-1.5 text-brown-dark/40 transition hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
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
                          <span className="text-sm font-bold text-brown-darker">
                            {formatPrice(line.price * line.quantity)}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Paket kurgusu */}
              {totals.bundleEligible ? (
                <p className="mt-4 flex items-center gap-2 rounded-2xl bg-green/10 px-4 py-3 text-xs font-semibold text-green">
                  <Gift size={14} aria-hidden="true" />
                  {BUNDLE_NAME} aktif — {formatPrice(totals.bundleDiscount)} indirim uygulandı
                </p>
              ) : (
                bundleSuggestion && (
                  <div className="mt-5 rounded-2xl border border-dashed border-green/40 bg-green/5 p-4">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest2 text-green">
                      <Gift size={13} aria-hidden="true" />
                      Paketi Tamamla
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brown/5">
                        <Image src={bundleSuggestion.image} alt={bundleSuggestion.name} fill sizes="3.5rem" className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-brown-darker">{bundleSuggestion.name}</p>
                        <p className="text-xs text-brown-dark/60">
                          Ekle, <span className="font-bold text-green">{BUNDLE_NAME} %10</span> açılsın
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addItem(bundleSuggestion)}
                        aria-label={`${bundleSuggestion.name} ürününü sepete ekle`}
                        className="rounded-full bg-green p-2.5 text-cream transition hover:bg-brown-darker"
                      >
                        <Plus size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )
              )}

              {/* Kupon */}
              <div className="mt-5">
                {totals.couponValid && couponCode ? (
                  <p className="flex items-center justify-between rounded-2xl bg-peach/20 px-4 py-3 text-xs font-semibold text-brown-darker">
                    <span className="flex items-center gap-2">
                      <BadgePercent size={14} className="text-green" aria-hidden="true" />
                      {couponCode} uygulandı — {formatPrice(totals.couponDiscount)}
                      <span className="font-normal text-brown-dark/50">(demo)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCoupon(null)}
                      aria-label="Kuponu kaldır"
                      className="rounded-full p-1 text-brown-dark/50 hover:text-brown-darker"
                    >
                      <X size={13} aria-hidden="true" />
                    </button>
                  </p>
                ) : (
                  <form onSubmit={applyCoupon} className="flex gap-2">
                    <label htmlFor="drawer-coupon" className="sr-only">
                      Kupon kodu
                    </label>
                    <input
                      id="drawer-coupon"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError(false);
                      }}
                      placeholder="Kupon kodu (ör. VENTI10)"
                      aria-invalid={couponError}
                      className="min-w-0 flex-1 rounded-full border border-brown/20 bg-white px-4 py-2.5 text-sm outline-none focus-visible:border-green"
                    />
                    <button
                      type="submit"
                      className="shrink-0 rounded-full border border-brown/30 px-4 py-2.5 text-sm font-semibold transition hover:border-brown-darker"
                    >
                      Uygula
                    </button>
                  </form>
                )}
                {couponError && (
                  <p role="alert" className="mt-1.5 px-2 text-xs text-red-700">
                    Bu kod geçerli değil.
                  </p>
                )}
              </div>
            </div>

            {/* Özet + aksiyonlar */}
            <div className="border-t border-brown/10 px-6 py-5">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-brown-dark/70">Ara toplam</dt>
                  <dd className="font-semibold">{formatPrice(totals.subtotal)}</dd>
                </div>
                {totals.bundleDiscount > 0 && (
                  <div className="flex justify-between text-green">
                    <dt>{BUNDLE_NAME}</dt>
                    <dd className="font-semibold">−{formatPrice(totals.bundleDiscount)}</dd>
                  </div>
                )}
                {totals.couponDiscount > 0 && (
                  <div className="flex justify-between text-green">
                    <dt>Kupon ({couponCode})</dt>
                    <dd className="font-semibold">−{formatPrice(totals.couponDiscount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-brown-dark/70">Kargo</dt>
                  <dd className="font-semibold">
                    {totals.freeShipping ? "Ücretsiz" : formatPrice(totals.shippingCost)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-brown/10 pt-2 text-base font-bold text-brown-darker">
                  <dt>Toplam</dt>
                  <dd>
                    <span className="flex items-center gap-1.5">
                      {(totals.bundleDiscount > 0 || totals.couponDiscount > 0) && (
                        <Check size={14} className="text-green" aria-hidden="true" />
                      )}
                      {formatPrice(totals.total)}
                    </span>
                  </dd>
                </div>
              </dl>
              <Link
                href="/odeme"
                onClick={closeCartDrawer}
                className="mt-4 block rounded-full bg-brown-darker py-3.5 text-center text-sm font-bold text-cream transition hover:bg-green"
              >
                Ödemeye Geç — {formatPrice(totals.total)}
              </Link>
              <button
                type="button"
                onClick={closeCartDrawer}
                className="mt-2.5 w-full text-center text-xs font-medium text-brown-dark/50 underline-offset-2 hover:underline"
              >
                Alışverişe devam et
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
