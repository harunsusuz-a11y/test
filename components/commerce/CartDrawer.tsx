"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BadgePercent, Check, Gift, Minus, Plus, Trash2, Truck, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { formatPrice } from "@/lib/utils/format";
import { computeCartTotals, validateCoupon, fetchShippingSettings } from "@/lib/utils/cart-math";
import { Progress } from "@/components/ui/Progress";

const BUNDLE_NAME = "Bar + Krema Paketi";

export function CartDrawer() {
  const { closeCartDrawer } = useUiStore();
  const lines = useCartStore((s) => s.lines);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const addItem = useCartStore((s) => s.addItem);
  const couponCode = useCartStore((s) => s.couponCode);
  const setCoupon = useCartStore((s) => s.setCoupon);
  const [open, setOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState(false);
  const [couponErrorMsg, setCouponErrorMsg] = useState("Geçersiz kupon kodu");
  const [appliedCouponDiscount, setAppliedCouponDiscount] = useState(0);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(300);
  const [standardShippingCost, setStandardShippingCost] = useState(29.9);

  useEffect(() => {
    fetchShippingSettings().then((s) => {
      setFreeShippingThreshold(s.free_shipping_threshold);
      setStandardShippingCost(s.standard_shipping_cost);
    });
  }, []);

  const totals = computeCartTotals(lines, {
    couponDiscount: appliedCouponDiscount,
    couponValid: !!couponCode && appliedCouponDiscount > 0,
    freeShippingThreshold,
    standardShippingCost,
  });
  const progress = Math.min(100, (totals.discountedSubtotal / (totals.discountedSubtotal + totals.remainingForFreeShipping || 1)) * 100);
  const bundleSuggestion = useMemo(() => { if (!totals.bundleMissingCategory) return null; return null; }, [totals.bundleMissingCategory]);
  const totalCount = lines.reduce((n, l) => n + l.quantity, 0);

  if (lines.length === 0) return null;

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    const trial = couponInput.trim().toUpperCase();
    if (!trial) return;
    const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
    const result = await validateCoupon(trial, subtotal);
    if (result.valid && result.discount_value) {
      const discount = result.discount_type === "percent" ? subtotal * (result.discount_value / 100) : result.discount_value;
      const final = result.max_discount ? Math.min(discount, result.max_discount) : discount;
      setAppliedCouponDiscount(final); setCoupon(trial); setCouponError(false); setCouponInput("");
    } else { setCouponErrorMsg(result.error ?? "Geçersiz kupon kodu"); setCouponError(true); }
  }

  return (
    <>
      {/* ── Sağ kenar ince şerit ── */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Sepeti aç, ${totalCount} ürün`}
          className="group fixed right-0 top-1/2 z-[80] -translate-y-1/2 flex flex-col items-center justify-center gap-1.5 rounded-l-xl bg-brown-darker py-6 w-7 hover:w-14 transition-all duration-300 shadow-lg shadow-brown-darker/30 overflow-hidden"
        >
          {/* Ürün sayısı rozeti */}
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-peach text-[10px] font-bold text-brown-darker">
            {totalCount}
          </span>
          {/* Dikey yazı — normal halde görünür, hover'da kaybolur */}
          <span
            className="whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-cream/80 transition-opacity duration-200 group-hover:opacity-0"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Sepet
          </span>
          {/* Hover'da fiyat */}
          <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] font-bold text-cream text-center px-1 leading-tight">
            {formatPrice(totals.total)}
          </span>
        </button>
      )}

      {/* ── Açık drawer ── */}
      {open && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Sepetim">
          <button
            type="button"
            aria-label="Sepeti kapat"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-brown-darker/40 motion-safe:animate-[fadeIn_.2s_ease-out]"
          />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-cream shadow-2xl shadow-brown-darker/30 motion-safe:animate-[slideInRight_.3s_cubic-bezier(.16,1,.3,1)]">
            <div className="flex items-center justify-between border-b border-brown/10 px-5 py-4">
              <p className="font-display text-lg font-extrabold text-brown-darker">
                Sepetim <span className="text-sm font-semibold text-brown-dark/50">({totalCount} ürün)</span>
              </p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Kapat"
                className="flex h-9 w-9 items-center justify-center rounded-full text-brown-dark/60 transition hover:bg-brown/5 hover:text-brown-darker">
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="border-b border-brown/10 px-5 py-3">
              <p className="flex items-center gap-2 text-xs font-semibold text-brown-dark/80">
                <Truck size={13} className="text-green" aria-hidden="true" />
                {totals.freeShipping ? "Kargon ücretsiz" : `Ücretsiz kargoya ${formatPrice(totals.remainingForFreeShipping)} kaldı`}
              </p>
              <Progress value={totals.freeShipping ? 100 : progress} aria-label="Ücretsiz kargo ilerlemesi" className="mt-2 h-1.5" />
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              <ul className="space-y-3">
                {lines.map((line) => (
                  <li key={line.slug} className="flex gap-3 rounded-2xl border border-brown/10 bg-white/60 p-2.5">
                    <Link href={`/urun/${line.slug}`} onClick={() => setOpen(false)} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brown/5">
                      <Image src={line.image} alt={line.name} fill sizes="4rem" className="object-cover" />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs font-semibold text-brown-darker leading-snug">{line.name}</p>
                        <button type="button" aria-label={`${line.name} ürününü sepetten kaldır`} onClick={() => removeItem(line.slug)}
                          className="rounded-full p-1 text-brown-dark/40 transition hover:bg-red-50 hover:text-red-700">
                          <Trash2 size={12} aria-hidden="true" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-1.5">
                        <div className="flex items-center gap-1.5">
                          <button type="button" aria-label={`${line.name} adedini azalt`} onClick={() => updateQuantity(line.slug, line.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-brown/20 transition hover:border-brown/40">
                            <Minus size={10} aria-hidden="true" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold" aria-live="polite">{line.quantity}</span>
                          <button type="button" aria-label={`${line.name} adedini artır`} onClick={() => updateQuantity(line.slug, line.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-brown/20 transition hover:border-brown/40">
                            <Plus size={10} aria-hidden="true" />
                          </button>
                        </div>
                        <span className="text-xs font-bold text-brown-darker">{formatPrice(line.price * line.quantity)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {totals.bundleEligible && (
                <p className="mt-3 flex items-center gap-2 rounded-2xl bg-green/10 px-3 py-2.5 text-xs font-semibold text-green">
                  <Gift size={13} aria-hidden="true" />{BUNDLE_NAME} aktif — {formatPrice(totals.bundleDiscount)} indirim
                </p>
              )}

              <div className="mt-4">
                {totals.couponValid && couponCode ? (
                  <p className="flex items-center justify-between rounded-2xl bg-peach/20 px-3 py-2.5 text-xs font-semibold text-brown-darker">
                    <span className="flex items-center gap-2"><BadgePercent size={13} className="text-green" aria-hidden="true" />{couponCode} — {formatPrice(totals.couponDiscount)}</span>
                    <button type="button" onClick={() => { setCoupon(null); setAppliedCouponDiscount(0); }} aria-label="Kuponu kaldır"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-brown-dark/50 hover:text-brown-darker">
                      <X size={12} aria-hidden="true" />
                    </button>
                  </p>
                ) : (
                  <form onSubmit={applyCoupon} className="flex gap-2">
                    <label htmlFor="drawer-coupon" className="sr-only">Kupon kodu</label>
                    <input id="drawer-coupon" value={couponInput} onChange={(e) => { setCouponInput(e.target.value); setCouponError(false); }}
                      placeholder="Kupon kodu (ör. VENTI10)" aria-invalid={couponError}
                      className="min-w-0 flex-1 rounded-full border border-brown/20 bg-white px-3 py-2 text-xs outline-none focus-visible:border-green" />
                    <button type="submit" className="shrink-0 rounded-full border border-brown/30 px-3 py-2 text-xs font-semibold transition hover:border-brown-darker">Uygula</button>
                  </form>
                )}
                {couponError && <p role="alert" className="mt-1.5 px-2 text-xs text-red-700">{couponErrorMsg}</p>}
              </div>
            </div>

            <div className="border-t border-brown/10 px-5 py-4">
              <dl className="space-y-1 text-xs">
                <div className="flex justify-between"><dt className="text-brown-dark/70">Ara toplam</dt><dd className="font-semibold">{formatPrice(totals.subtotal)}</dd></div>
                {totals.bundleDiscount > 0 && <div className="flex justify-between text-green"><dt>{BUNDLE_NAME}</dt><dd className="font-semibold">−{formatPrice(totals.bundleDiscount)}</dd></div>}
                {totals.couponDiscount > 0 && <div className="flex justify-between text-green"><dt>Kupon ({couponCode})</dt><dd className="font-semibold">−{formatPrice(totals.couponDiscount)}</dd></div>}
                <div className="flex justify-between"><dt className="text-brown-dark/70">Kargo</dt><dd className="font-semibold">{totals.freeShipping ? "Ücretsiz" : formatPrice(totals.shippingCost)}</dd></div>
                <div className="flex justify-between border-t border-brown/10 pt-1.5 text-sm font-bold text-brown-darker">
                  <dt>Toplam</dt>
                  <dd><span className="flex items-center gap-1">{(totals.bundleDiscount > 0 || totals.couponDiscount > 0) && <Check size={12} className="text-green" aria-hidden="true" />}{formatPrice(totals.total)}</span></dd>
                </div>
              </dl>
              <Link href="/odeme" onClick={() => setOpen(false)}
                className="mt-3 block rounded-full bg-brown-darker py-3 text-center text-xs font-bold text-cream transition hover:bg-green">
                Ödemeye Geç — {formatPrice(totals.total)}
              </Link>
              <button type="button" onClick={() => setOpen(false)}
                className="mt-2 w-full text-center text-xs text-brown-dark/50 hover:underline">
                Alışverişe devam et
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
