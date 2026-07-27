"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { products } from "@/content/products";
import { formatPrice } from "@/lib/utils/format";
import {
  subscriptionFrequencies,
  subscriptionDeliverySchema,
  type SubscriptionDeliveryValues,
} from "@/content/subscription";

const steps = ["Ürünü Seç", "Sıklık ve Miktar", "Teslimat Bilgileri"] as const;

export function SubscriptionFlow() {
  const [step, setStep] = useState(0);
  const [productSlug, setProductSlug] = useState(products[0]?.slug ?? "");
  const [frequency, setFrequency] = useState<(typeof subscriptionFrequencies)[number]["value"]>("aylik");
  const [quantity, setQuantity] = useState(1);
  const [submitted, setSubmitted] = useState<SubscriptionDeliveryValues | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionDeliveryValues>({ resolver: zodResolver(subscriptionDeliverySchema) });

  const selectedProduct = products.find((p) => p.slug === productSlug) ?? products[0];

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
          {selectedProduct?.name} — {subscriptionFrequencies.find((f) => f.value === frequency)?.label}, {quantity}{" "}
          adet. Teslimat: {submitted.fullName}, {submitted.city}.
        </p>
        <p className="mt-4 rounded-xl bg-brown-darker/5 px-4 py-3 text-xs text-brown-dark/60">
          Bu bir DEMO akıştır — gerçek bir tekrarlayan ödeme henüz oluşturulmadı. Ödeme sağlayıcısı entegre
          edildiğinde bu adım gerçek tahsilata bağlanacaktır.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Adım göstergesi */}
      <ol className="mb-10 flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-wide">
        {steps.map((label, i) => (
          <li key={label} className={`flex items-center gap-2 ${i <= step ? "text-green" : "text-brown-dark/30"}`}>
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${
                i <= step ? "border-green bg-green text-cream" : "border-brown/20"
              }`}
            >
              {i + 1}
            </span>
            {label}
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
                className={`rounded-xl border p-4 text-left transition ${
                  productSlug === p.slug ? "border-green bg-green/10" : "border-brown/15 hover:border-green/50"
                }`}
              >
                <p className="font-display font-bold text-brown-darker">{p.name}</p>
                <p className="mt-1 text-sm text-brown-dark/60">{formatPrice(p.price)}</p>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mt-8 rounded-full bg-brown px-7 py-3 text-sm font-bold text-cream transition hover:bg-green"
          >
            Devam Et
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="mb-5 font-display text-xl font-extrabold text-brown-darker">Sıklığını ve miktarını belirle</h2>
          <div className="mb-6 flex flex-wrap gap-3">
            {subscriptionFrequencies.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFrequency(f.value)}
                className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                  frequency === f.value ? "border-green bg-green/10 text-green" : "border-brown/20 text-brown-dark"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

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
              className="rounded-full bg-brown px-7 py-3 text-sm font-bold text-cream transition hover:bg-green"
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
              className="rounded-full bg-brown px-7 py-3 text-sm font-bold text-cream transition hover:bg-green disabled:opacity-60"
            >
              {isSubmitting ? "Gönderiliyor…" : "Aboneliği Başlat"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
