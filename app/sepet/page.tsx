"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { BadgePercent, Gift, Minus, Plus, Trash2, Truck, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils/format";
import { computeCartTotals } from "@/lib/utils/cart-math";
import { BUNDLE_NAME } from "@/content/discounts";
import { PageHeader } from "@/components/ui/PageHeader";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/animations/Reveal";
import { products, getProductBySlug } from "@/content/products";

/**
 * Tam sayfa sepet — birincil deneyim artık CartDrawer'dadır (yandan açılır);
 * bu sayfa derin link, paylaşım ve JS'siz senaryolar için aynı cart-math
 * motorunu kullanarak durur. İki yüzeyde de toplamlar birebir aynıdır.
 */
export default function CartPage() {
  const lines = useCartStore((s) => s.lines);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const couponCode = useCartStore((s) => s.couponCode);
  const setCoupon = useCartStore((s) => s.setCoupon);
  const addItem = useCartStore((s) => s.addItem);

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState(false);

  const totals = computeCartTotals(lines, couponCode);
  const progress = totals.freeShipping
    ? 100
    : Math.min(100, (totals.discountedSubtotal / (totals.discountedSubtotal + totals.remainingForFreeShipping || 1)) * 100);

  const bundleSuggestion = useMemo(() => {
    if (!totals.bundleMissingCategory) return null;
    return products.find((p) => p.category === totals.bundleMissingCategory) ?? null;
  }, [totals.bundleMissingCategory]);

  function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    const trial = couponInput.trim().toUpperCase();
    if (!trial) return;
    if (computeCartTotals(lines, trial).couponValid) {
      setCoupon(trial);
      setCouponError(false);
      setCouponInput("");
    } else {
      setCouponError(true);
    }
  }

  if (lines.length === 0) {
    return (
      <>
        <PageHeader eyebrow="Sepetim" title="Sepetin boş." description="İlk ısırık bir tık uzağında — ürün ailesine göz at." />
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-14">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <Reveal key={p.slug} delay={i * 90}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Sepetim" title="Neredeyse hazır." description="Paket indirimi ve kupon kodun burada uygulanır." />
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-12">
        {/* Ücretsiz kargo ilerlemesi */}
        <Reveal>
          <div className="mb-10 rounded-2xl border border-brown/10 bg-white/60 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-brown-darker">
              <Truck size={15} className="text-green" aria-hidden="true" />
              {totals.freeShipping
                ? "Ücretsiz kargo hakkı kazandın 🎉"
                : `Ücretsiz kargoya ${formatPrice(totals.remainingForFreeShipping)} kaldı`}
            </p>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-brown/10" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Ücretsiz kargo ilerlemesi">
              <div className="h-full rounded-full bg-green transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-3">
          {/* Satırlar */}
          <div className="space-y-4 lg:col-span-2">
            {lines.map((line, i) => {
              const product = getProductBySlug(line.slug);
              return (
                <Reveal key={line.slug} delay={i * 70}>
                  <div className="flex gap-5 rounded-3xl border border-brown/10 bg-white/60 p-4 transition-shadow hover:shadow-lg hover:shadow-brown-darker/5">
                    <Link href={`/urun/${line.slug}`} className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-brown/5">
                      <Image src={line.image} alt={line.name} fill sizes="7rem" className="object-cover transition-transform duration-500 hover:scale-105" />
                    </Link>
                    <div className="flex flex-1 flex-col justify-between py-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link href={`/urun/${line.slug}`} className="font-display text-lg font-bold text-brown-darker hover:text-green">
                            {line.name}
                          </Link>
                          {product && (
                            <p className="text-xs uppercase tracking-wide text-brown-dark/50">{product.flavor}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          aria-label={`${line.name} ürününü sepetten kaldır`}
                          onClick={() => removeItem(line.slug)}
                          className="rounded-full p-2 text-brown-dark/40 transition hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-brown/20 bg-white/70">
                          <button type="button" aria-label="Adedi azalt" className="p-2.5" onClick={() => updateQuantity(line.slug, line.quantity - 1)}>
                            <Minus size={14} />
                          </button>
                          <span className="w-7 text-center text-sm font-bold" aria-live="polite">{line.quantity}</span>
                          <button type="button" aria-label="Adedi artır" className="p-2.5" onClick={() => updateQuantity(line.slug, line.quantity + 1)}>
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-display text-lg font-bold text-brown-darker">{formatPrice(line.price * line.quantity)}</span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}

            {/* Paket kurgusu */}
            {totals.bundleEligible ? (
              <Reveal>
                <p className="flex items-center gap-2 rounded-2xl bg-green/10 px-5 py-4 text-sm font-semibold text-green">
                  <Gift size={16} aria-hidden="true" />
                  {BUNDLE_NAME} aktif — {formatPrice(totals.bundleDiscount)} indirim otomatik uygulandı
                </p>
              </Reveal>
            ) : (
              bundleSuggestion && (
                <Reveal>
                  <div className="rounded-3xl border border-dashed border-green/40 bg-green/5 p-5">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest2 text-green">
                      <Gift size={14} aria-hidden="true" />
                      Paketi Tamamla — %10 kazan
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-brown/5">
                        <Image src={bundleSuggestion.image} alt={bundleSuggestion.name} fill sizes="5rem" className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-display font-bold text-brown-darker">{bundleSuggestion.name}</p>
                        <p className="mt-0.5 text-sm text-brown-dark/60">
                          Sepete ekle, <span className="font-bold text-green">{BUNDLE_NAME}</span> indirimi otomatik açılsın.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addItem(bundleSuggestion)}
                        className="shrink-0 rounded-full bg-green px-5 py-2.5 text-sm font-bold text-cream transition hover:bg-brown-darker"
                      >
                        Ekle
                      </button>
                    </div>
                  </div>
                </Reveal>
              )
            )}
          </div>

          {/* Özet */}
          <Reveal delay={150} className="h-fit lg:sticky lg:top-28">
            <div className="rounded-3xl border border-white/60 bg-white/50 p-7 shadow-lg shadow-brown-darker/5 backdrop-blur-md">
              <h2 className="font-display text-xl font-extrabold text-brown-darker">Sipariş Özeti</h2>

              {totals.couponValid && couponCode ? (
                <p className="mt-4 flex items-center justify-between rounded-2xl bg-peach/20 px-4 py-3 text-xs font-semibold text-brown-darker">
                  <span className="flex items-center gap-2">
                    <BadgePercent size={14} className="text-green" aria-hidden="true" />
                    {couponCode} <span className="font-normal text-brown-dark/50">(demo)</span>
                  </span>
                  <button type="button" onClick={() => setCoupon(null)} aria-label="Kuponu kaldır" className="rounded-full p-1 text-brown-dark/50 hover:text-brown-darker">
                    <X size={13} aria-hidden="true" />
                  </button>
                </p>
              ) : (
                <form onSubmit={applyCoupon} className="mt-4 flex gap-2">
                  <label htmlFor="coupon" className="sr-only">Kupon kodu</label>
                  <input
                    id="coupon"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setCouponError(false);
                    }}
                    placeholder="Kupon kodu (ör. VENTI10)"
                    aria-invalid={couponError}
                    className="min-w-0 flex-1 rounded-full border border-brown/20 bg-white px-4 py-2.5 text-sm outline-none focus-visible:border-green"
                  />
                  <button type="submit" className="shrink-0 rounded-full border border-brown/30 px-4 py-2.5 text-sm font-semibold transition hover:border-brown-darker">
                    Uygula
                  </button>
                </form>
              )}
              {couponError && (
                <p role="alert" className="mt-1.5 px-2 text-xs text-red-700">Bu kod geçerli değil.</p>
              )}

              <dl className="mt-5 space-y-2 border-t border-brown/10 pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-brown-dark/70">Ara Toplam</dt>
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
                    <dt>Kupon</dt>
                    <dd className="font-semibold">−{formatPrice(totals.couponDiscount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-brown-dark/70">Kargo</dt>
                  <dd className="font-semibold">{totals.freeShipping ? "Ücretsiz" : formatPrice(totals.shippingCost)}</dd>
                </div>
                <div className="flex justify-between border-t border-brown/10 pt-2 text-base font-bold text-brown-darker">
                  <dt>Genel Toplam</dt>
                  <dd>{formatPrice(totals.total)}</dd>
                </div>
              </dl>

              <Link
                href="/odeme"
                className="mt-6 block rounded-full bg-brown-darker px-7 py-3.5 text-center text-sm font-bold text-cream transition hover:scale-[1.02] hover:bg-green"
              >
                Ödemeye Geç
              </Link>

              <TrustBadges className="mt-6 justify-start gap-x-4 gap-y-2" />
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
