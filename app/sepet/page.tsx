"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { ProductCard } from "@/components/product/ProductCard";
import { products } from "@/content/products";

const FREE_SHIPPING_THRESHOLD = 300;

export default function CartPage() {
  const lines = useCartStore((s) => s.lines);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const cartSlugs = new Set(lines.map((l) => l.slug));
  const crossSell = products.filter((p) => !cartSlugs.has(p.slug));

  function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    // NOT: Gerçek bir kupon/indirim sistemi henüz bağlanmadı — demo mesaj.
    setCouponMessage(coupon ? "Kupon sistemi demo aşamasında — henüz gerçek indirim uygulanmıyor." : null);
  }

  if (lines.length === 0) {
    return (
      <>
        <PageHeader eyebrow="Sepetim" title="Sepetin boş" description="Ürünleri keşfetmeye ne dersin?" />
        <div className="mx-auto max-w-6xl px-5 pb-20">
          <div className="mb-12 text-center">
            <Link
              href="/magaza"
              className="inline-block rounded-full bg-brown px-7 py-3.5 text-sm font-bold text-cream transition hover:scale-105 hover:bg-green"
            >
              Mağazaya Git
            </Link>
          </div>
          {products.length > 0 && (
            <div>
              <h2 className="mb-6 text-center font-display text-xl font-extrabold text-brown-darker">
                Sana Uygun Ateşi Seç
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Sepetim" title="Sepetin" />
      <div className="mx-auto max-w-5xl px-5 pb-20">
        <div className="mb-8 rounded-xl bg-white/60 p-5">
          <p className="text-sm font-medium text-brown-darker">
            {remainingForFreeShipping > 0
              ? `Ücretsiz kargoya ${formatPrice(remainingForFreeShipping)} kaldı!`
              : "Ücretsiz kargo hakkı kazandın! 🎉"}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-brown/10">
            <div className="h-full rounded-full bg-green transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            {lines.map((line) => (
              <div key={line.slug} className="flex gap-4 rounded-xl bg-white/60 p-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-brown/5">
                  <Image src={line.image} alt={line.name} fill sizes="96px" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display font-bold text-brown-darker">{line.name}</p>
                    <button
                      type="button"
                      aria-label={`${line.name} ürününü sepetten kaldır`}
                      onClick={() => removeItem(line.slug)}
                      className="text-brown-dark/40 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-brown/20">
                      <button
                        type="button"
                        aria-label="Adedi azalt"
                        className="p-2"
                        onClick={() => updateQuantity(line.slug, line.quantity - 1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label="Adedi artır"
                        className="p-2"
                        onClick={() => updateQuantity(line.slug, line.quantity + 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-bold text-brown-darker">{formatPrice(line.price * line.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}

            {crossSell.length > 0 && (
              <div className="pt-6">
                <h2 className="mb-4 font-display text-lg font-bold text-brown-darker">Bunları da beğenebilirsin</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {crossSell.map((p) => (
                    <ProductCard key={p.slug} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-fit rounded-2xl bg-white/60 p-6">
            <h2 className="font-display text-lg font-bold text-brown-darker">Sipariş Özeti</h2>

            <form onSubmit={applyCoupon} className="mt-4 flex gap-2">
              <label htmlFor="coupon" className="sr-only">
                Kupon kodu
              </label>
              <input
                id="coupon"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Kupon kodu"
                className="min-w-0 flex-1 rounded-full border border-brown/20 px-4 py-2 text-sm outline-none focus-visible:border-green"
              />
              <button type="submit" className="shrink-0 rounded-full border border-brown/30 px-4 py-2 text-sm font-semibold">
                Uygula
              </button>
            </form>
            {couponMessage && <p className="mt-2 text-xs text-brown-dark/60">{couponMessage}</p>}

            <dl className="mt-5 space-y-2 border-t border-brown/10 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-brown-dark/70">Ara Toplam</dt>
                <dd className="font-semibold">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brown-dark/70">Kargo</dt>
                <dd className="font-semibold">{remainingForFreeShipping > 0 ? formatPrice(29.9) : "Ücretsiz"}</dd>
              </div>
              <div className="flex justify-between border-t border-brown/10 pt-2 text-base font-bold text-brown-darker">
                <dt>Genel Toplam</dt>
                <dd>{formatPrice(subtotal + (remainingForFreeShipping > 0 ? 29.9 : 0))}</dd>
              </div>
            </dl>

            <Link
              href="/odeme"
              className="mt-6 block rounded-full bg-brown px-7 py-3.5 text-center text-sm font-bold text-cream transition hover:scale-[1.02] hover:bg-green"
            >
              Ödemeye Geç
            </Link>

            <TrustBadges className="mt-6 justify-start gap-x-4 gap-y-2" />
          </div>
        </div>
      </div>
    </>
  );
}
