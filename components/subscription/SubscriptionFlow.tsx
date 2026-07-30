"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Star } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { products } from "@/content/products";
import { formatPrice } from "@/lib/utils/format";
import {
  subscriptionFrequencies,
  subscriptionDeliverySchema,
  SUBSCRIPTION_DISCOUNT,
  type SubscriptionDeliveryValues,
} from "@/content/subscription";

const steps = ["Ürünü Seç", "Sıklık ve Miktar", "Teslimat Bilgileri"] as const;

export function SubscriptionFlow() {
  const [step, setStep] = useState(0);
  const [productSlug, setProductSlug] = useState(products[0]?.slug ?? "");
  const [frequency, setFrequency] = useState<(typeof subscriptionFrequencies)[number]["value"]>("iki-haftalik");
  const [quantity, setQuantity] = useState(1);
  const [submitted, setSubmitted] = useState<SubscriptionDeliveryValues | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionDeliveryValues>({ resolver: zodResolver(subscriptionDeliverySchema) });

  const selectedProduct = products.find((p) => p.slug === productSlug) ?? products[0];
  const selectedFrequency = subscriptionFrequencies.find((f) => f.value === frequency) ?? subscriptionFrequencies[0];
  const unitPrice = selectedProduct?.price ?? 0;
  const listTotal = unitPrice * quantity;
  const discountedTotal = listTotal * (1 - SUBSCRIPTION_DISCOUNT);

  async function onSubmit(values: SubscriptionDeliveryValues) {
    // NOT: Gerçek bir ödeme/tekrarlayan tahsilat sağlayıcısı henüz bağlanmadı.
    // Bu demo akış, checkout sayfasındaki soyut ödeme katmanıyla aynı mantığı izler.
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitted(values);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-green/20 bg-green/5 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green text-cream">
          <Check aria-hidden="true" />
        </div>
        <h2 className="font-display text-2xl font-extrabold text-brown-darker">Abonelik Talebin Alındı</h2>
        <p className="mt-3 text-sm text-brown-dark/70">
          {selectedProduct?.name} — {selectedFrequency.label}, {quantity} adet. Teslimat: {submitted.fullName},{" "}
          {submitted.city}.
        </p>
        <p className="mt-4 rounded-xl bg-brown-darker/5 px-4 py-3 text-xs text-brown-dark/60">
          Bu bir DEMO akıştır — gerçek bir tekrarlayan ödeme henüz oluşturulmadı. Ödeme sağlayıcısı entegre
          edildiğinde bu adım gerçek tahsilata bağlanacaktır.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div>
        {/* Adım göstergesi — bağlayıcı çizgili, ödeme sayfasıyla tutarlı */}
        <ol className="mb-10 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wide sm:gap-4">
          {steps.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] transition ${
                  i <= step ? "border-green bg-green text-cream" : "border-brown/20 text-brown-dark/40"
                }`}
              >
                {i < step ? <Check size={13} /> : i + 1}
              </span>
              <span className={`hidden sm:inline ${i <= step ? "text-brown-darker" : "text-brown-dark/40"}`}>
                {label}
              </span>
              {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-brown/15 sm:w-10" aria-hidden="true" />}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <div>
            <h2 className="mb-5 font-display text-xl font-extrabold text-brown-darker">Ürününü seç</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {products.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => setProductSlug(p.slug)}
                  className={`overflow-hidden rounded-2xl border text-left transition ${
                    productSlug === p.slug ? "border-green ring-1 ring-green" : "border-brown/15 hover:border-green/50"
                  }`}
                >
                  <div className="relative aspect-[4/3] bg-brown/5">
                    <Image src={p.image} alt={p.name} fill sizes="240px" className="object-cover" />
                    {productSlug === p.slug && (
                      <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-green text-cream">
                        <Check size={14} />
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-display font-bold text-brown-darker">{p.name}</p>
                    <p className="mt-1 text-sm text-brown-dark/60">{formatPrice(p.price)}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-8 rounded-full bg-brown px-7 py-3 text-sm font-bold text-cream transition hover:scale-[1.02] hover:bg-green"
            >
              Devam Et
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="mb-5 font-display text-xl font-extrabold text-brown-darker">Sıklığını ve miktarını belirle</h2>
            <RadioGroup
              value={frequency}
              onValueChange={(v) => setFrequency(v as (typeof subscriptionFrequencies)[number]["value"])}
              className="mb-6 grid gap-3 sm:grid-cols-3"
              aria-label="Teslimat sıklığı"
            >
              {subscriptionFrequencies.map((f) => (
                <RadioGroupItem
                  key={f.value}
                  value={f.value}
                  className={`relative rounded-2xl border p-4 text-left transition ${
                    frequency === f.value ? "border-green bg-green/10" : "border-brown/20 hover:border-green/40"
                  }`}
                >
                  {"popular" in f && f.popular && (
                    <span className="absolute -top-2.5 right-3 flex items-center gap-1 rounded-full bg-peach px-2 py-0.5 text-[10px] font-bold text-brown-darker">
                      <Star size={10} fill="currentColor" /> Popüler
                    </span>
                  )}
                  <p className="font-display font-bold text-brown-darker">{f.label}</p>
                  <p className="mt-1 text-xs text-brown-dark/60">{f.description}</p>
                </RadioGroupItem>
              ))}
            </RadioGroup>

            <label className="mb-1 block text-sm font-semibold text-brown-dark" htmlFor="quantity">
              Miktar
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-9 w-9 rounded-full border border-brown/20 text-lg"
                aria-label="Miktarı azalt"
              >
                −
              </button>
              <span id="quantity" className="w-8 text-center font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="h-9 w-9 rounded-full border border-brown/20 text-lg"
                aria-label="Miktarı artır"
              >
                +
              </button>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="rounded-full border border-brown/20 px-7 py-3 text-sm font-bold text-brown-dark"
              >
                Geri
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-full bg-brown px-7 py-3 text-sm font-bold text-cream transition hover:scale-[1.02] hover:bg-green"
              >
                Devam Et
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <h2 className="mb-5 font-display text-xl font-extrabold text-brown-darker">Teslimat bilgilerini tamamla</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-brown-dark" htmlFor="fullName">
                  Ad Soyad
                </label>
                <input
                  id="fullName"
                  className="w-full rounded-xl border border-brown/20 px-4 py-3 text-sm outline-none focus-visible:border-green"
                  aria-invalid={!!errors.fullName}
                  {...register("fullName")}
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-700">{errors.fullName.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-brown-dark" htmlFor="phone">
                  Telefon
                </label>
                <input
                  id="phone"
                  className="w-full rounded-xl border border-brown/20 px-4 py-3 text-sm outline-none focus-visible:border-green"
                  aria-invalid={!!errors.phone}
                  {...register("phone")}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-700">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-brown-dark" htmlFor="address">
                  Adres
                </label>
                <textarea
                  id="address"
                  rows={3}
                  className="w-full rounded-xl border border-brown/20 px-4 py-3 text-sm outline-none focus-visible:border-green"
                  aria-invalid={!!errors.address}
                  {...register("address")}
                />
                {errors.address && <p className="mt-1 text-xs text-red-700">{errors.address.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-brown-dark" htmlFor="city">
                  Şehir
                </label>
                <input
                  id="city"
                  className="w-full rounded-xl border border-brown/20 px-4 py-3 text-sm outline-none focus-visible:border-green"
                  aria-invalid={!!errors.city}
                  {...register("city")}
                />
                {errors.city && <p className="mt-1 text-xs text-red-700">{errors.city.message}</p>}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-full border border-brown/20 px-7 py-3 text-sm font-bold text-brown-dark"
              >
                Geri
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-brown px-7 py-3 text-sm font-bold text-cream transition hover:scale-[1.02] hover:bg-green disabled:opacity-60"
              >
                {isSubmitting ? "Gönderiliyor…" : "Aboneliği Başlat"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Canlı sipariş özeti — checkout sayfasıyla tutarlı, seçimler anlık güncellenir */}
      <div className="h-fit rounded-2xl border border-brown/10 bg-white/60 p-6">
        <h2 className="font-display text-lg font-bold text-brown-darker">Abonelik Özeti</h2>

        {selectedProduct && (
          <div className="mt-4 flex gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brown/5">
              <Image src={selectedProduct.image} alt={selectedProduct.name} fill sizes="64px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold text-brown-darker">{selectedProduct.name}</p>
              <p className="text-xs text-brown-dark/60">{selectedFrequency.label}</p>
            </div>
          </div>
        )}

        <dl className="mt-5 space-y-2 border-t border-brown/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-brown-dark/70">Adet</dt>
            <dd className="font-semibold">{quantity}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-brown-dark/70">Liste Fiyatı</dt>
            <dd className="text-brown-dark/40 line-through">{formatPrice(listTotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-green">Abonelik İndirimi (%{SUBSCRIPTION_DISCOUNT * 100})</dt>
            <dd className="font-semibold text-green">−{formatPrice(listTotal - discountedTotal)}</dd>
          </div>
          <div className="flex justify-between border-t border-brown/10 pt-2 text-base font-bold text-brown-darker">
            <dt>Her Teslimatta</dt>
            <dd>{formatPrice(discountedTotal)}</dd>
          </div>
        </dl>

        <p className="mt-4 text-xs text-brown-dark/50">
          Kargo ücretsiz. Teslimat sıklığını, ürününü veya miktarını dilediğin zaman değiştirebilir, aboneliği
          tek tıkla durdurabilirsin.
        </p>
      </div>
    </div>
  );
}
