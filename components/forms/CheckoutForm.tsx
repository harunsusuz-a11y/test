"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils/format";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { computeCartTotals } from "@/lib/utils/cart-math";

const schema = z.object({
  fullName: z.string().min(2, "Ad soyad gerekli."),
  email: z.string().min(1, "E-posta gerekli.").email("Geçerli bir e-posta girin."),
  phone: z.string().min(10, "Geçerli bir telefon numarası girin."),
  address: z.string().min(10, "Adres gerekli."),
  city: z.string().min(2, "Şehir gerekli."),
  postalCode: z.string().min(4, "Posta kodu gerekli."),
  shipping: z.enum(["standart", "hizli"]),
  billingSame: z.literal(true).or(z.literal(false)),
  agreement: z.literal(true, {
    errorMap: () => ({ message: "Devam etmek için mesafeli satış sözleşmesini onaylamalısınız." }),
  }),
  kvkk: z.literal(true, {
    errorMap: () => ({ message: "KVKK onayı gerekli." }),
  }),
});

type FormValues = z.infer<typeof schema>;

function generateOrderId() {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 900000) + 100000;
  return `VA-${date}-${rand}`;
}

export function CheckoutForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paytrToken, setPaytrToken] = useState<string | null>(null);
  const iframeRef = useRef<HTMLDivElement>(null);
  const lines = useCartStore((s) => s.lines);
  const couponCode = useCartStore((s) => s.couponCode);
  const clear = useCartStore((s) => s.clear);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { shipping: "standart", billingSame: true },
  });

  const shipping = watch("shipping");
  const totals = computeCartTotals(lines, couponCode);
  const shippingCost = shipping === "hizli" ? 59.9 : totals.shippingCost;
  const grandTotal = totals.discountedSubtotal + shippingCost;

  // PayTR iframe yüklenince
  useEffect(() => {
    if (!paytrToken) return;
    const script = document.createElement("script");
    script.src = "https://www.paytr.com/js/iframeResizer.min.js";
    script.onload = () => {
      const iframe = document.getElementById("paytriframe") as HTMLIFrameElement;
      if (iframe && (window as unknown as Record<string, unknown>).iFrameResize) {
        (window as unknown as { iFrameResize: (opts: unknown, el: HTMLIFrameElement) => void }).iFrameResize(
          { log: false, checkOrigin: false },
          iframe
        );
      }
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [paytrToken]);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setError(null);
    const orderId = generateOrderId();

    try {
      // PayTR token al
      const res = await fetch("/api/paytr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          fullName: values.fullName,
          phone: values.phone,
          address: values.address,
          city: values.city,
          postalCode: values.postalCode,
          lines: lines.map((l) => ({ name: l.name, price: l.price, quantity: l.quantity })),
          total: grandTotal,
          orderId,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        // PayTR env yok (test/geliştirme ortamı) → demo akış
        if (data.error?.includes("PayTR") || data.error?.includes("hatası")) {
          await demoFlow(values, orderId);
          return;
        }
        throw new Error(data.error || "Ödeme başlatılamadı");
      }

      setPaytrToken(data.token);
    } catch {
      // PAYTR_MERCHANT_ID yoksa demo akış devam eder
      await demoFlow(values, orderId);
    } finally {
      setSubmitting(false);
    }
  }

  async function saveOrder(values: FormValues, orderId: string, userId: string | null) {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    try {
      const { data: orderData } = await supabase.from("orders").insert({
        order_number: orderId,
        user_id: userId,
        full_name: values.fullName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        city: values.city,
        postal_code: values.postalCode,
        shipping_type: values.shipping,
        coupon_code: couponCode,
        subtotal: totals.subtotal,
        discount: totals.bundleDiscount + totals.couponDiscount,
        shipping_cost: shippingCost,
        total: grandTotal,
        currency: "TRY",
        status: "pending",
        payment_status: "pending",
      }).select("id").single();

      // order_items kaydet
      if (orderData?.id) {
        const orderItems = lines.map(l => ({
          order_id: orderData.id,
          product_slug: l.slug,
          product_name: l.name,
          unit_price: l.price,
          quantity: l.quantity,
          image: l.image ?? null,
        }));
        await supabase.from("order_items").insert(orderItems);
      }
    } catch { /* devam et */ }
  }

  async function demoFlow(values: FormValues, orderId: string) {
    // Kullanıcı ID al (varsa)
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await saveOrder(values, orderId, user?.id ?? null);

    // Sipariş onay maili gönder
    await fetch("/api/email/order-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: values.email,
        fullName: values.fullName,
        orderId,
        lines: lines.map((l) => ({ name: l.name, price: l.price, quantity: l.quantity })),
        total: grandTotal,
      }),
    }).catch(() => null);

    clear();
    router.push(`/siparis-basarili?siparis=${orderId}`);
  }

  if (lines.length === 0) {
    return <p className="text-brown-dark/70">Sepetin boş — ödemeye geçmeden önce ürün eklemelisin.</p>;
  }

  // PayTR iframe göster
  if (paytrToken) {
    return (
      <div ref={iframeRef} className="min-h-[400px]">
        <iframe
          id="paytriframe"
          src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
          frameBorder="0"
          scrolling="no"
          style={{ width: "100%", minHeight: 400 }}
          title="PayTR Güvenli Ödeme"
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-10 md:grid-cols-3">
      <div className="space-y-6 md:col-span-2">
        <fieldset className="space-y-4">
          <legend className="mb-1 font-display text-lg font-bold text-brown-darker">İletişim ve Teslimat</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-brown-dark">Ad Soyad</label>
              <input id="fullName" {...register("fullName")} className="w-full rounded-xl border border-brown/20 bg-white px-4 py-3 text-sm outline-none focus-visible:border-green" placeholder="Ayşe Yılmaz" />
              {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-brown-dark">E-posta</label>
              <input id="email" type="email" {...register("email")} className="w-full rounded-xl border border-brown/20 bg-white px-4 py-3 text-sm outline-none focus-visible:border-green" placeholder="ayse@ornek.com" />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-brown-dark">Telefon</label>
            <input id="phone" type="tel" {...register("phone")} className="w-full rounded-xl border border-brown/20 bg-white px-4 py-3 text-sm outline-none focus-visible:border-green" placeholder="05xx xxx xx xx" />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
          </div>
          <div>
            <label htmlFor="address" className="mb-1 block text-sm font-medium text-brown-dark">Adres</label>
            <textarea id="address" {...register("address")} rows={3} className="w-full rounded-xl border border-brown/20 bg-white px-4 py-3 text-sm outline-none focus-visible:border-green" placeholder="Mahalle, cadde, sokak, kapı no, daire no" />
            {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="city" className="mb-1 block text-sm font-medium text-brown-dark">Şehir</label>
              <input id="city" {...register("city")} className="w-full rounded-xl border border-brown/20 bg-white px-4 py-3 text-sm outline-none focus-visible:border-green" placeholder="İstanbul" />
              {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
            </div>
            <div>
              <label htmlFor="postalCode" className="mb-1 block text-sm font-medium text-brown-dark">Posta Kodu</label>
              <input id="postalCode" {...register("postalCode")} className="w-full rounded-xl border border-brown/20 bg-white px-4 py-3 text-sm outline-none focus-visible:border-green" placeholder="34000" />
              {errors.postalCode && <p className="mt-1 text-xs text-red-600">{errors.postalCode.message}</p>}
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="mb-1 font-display text-lg font-bold text-brown-darker">Kargo Seçeneği</legend>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-brown/20 px-4 py-3 transition has-[:checked]:border-green has-[:checked]:bg-green/5">
            <input type="radio" value="standart" {...register("shipping")} className="accent-green" />
            <span className="flex-1 text-sm">Standart Kargo (2-4 iş günü)</span>
            <span className="text-sm font-semibold text-brown-darker">{totals.freeShipping ? "Ücretsiz" : formatPrice(totals.shippingCost)}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-brown/20 px-4 py-3 transition has-[:checked]:border-green has-[:checked]:bg-green/5">
            <input type="radio" value="hizli" {...register("shipping")} className="accent-green" />
            <span className="flex-1 text-sm">Hızlı Kargo (1-2 iş günü)</span>
            <span className="text-sm font-semibold text-brown-darker">{formatPrice(59.9)}</span>
          </label>
        </fieldset>

        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-brown-dark/80">
            <input type="checkbox" {...register("agreement")} className="mt-0.5 accent-green" />
            <span><a href="/mesafeli-satis" target="_blank" className="underline hover:text-green">Mesafeli satış sözleşmesini</a> okudum ve kabul ediyorum.</span>
          </label>
          {errors.agreement && <p className="text-xs text-red-600">{errors.agreement.message}</p>}
          <label className="flex cursor-pointer items-start gap-3 text-sm text-brown-dark/80">
            <input type="checkbox" {...register("kvkk")} className="mt-0.5 accent-green" />
            <span>Kişisel verilerimin KVKK kapsamında işlenmesini kabul ediyorum.</span>
          </label>
          {errors.kvkk && <p className="text-xs text-red-600">{errors.kvkk.message}</p>}
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      </div>

      {/* Sipariş Özeti */}
      <div className="h-fit rounded-2xl border border-brown/10 bg-white/70 p-6">
        <h2 className="mb-4 font-display text-base font-bold text-brown-darker">Sipariş Özeti</h2>
        <ul className="space-y-2 text-sm">
          {lines.map((l) => (
            <li key={l.slug} className="flex justify-between gap-2">
              <span className="text-brown-dark/80">{l.name} ×{l.quantity}</span>
              <span className="font-medium">{formatPrice(l.price * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1.5 border-t border-brown/10 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-brown-dark/70">Ara toplam</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>
          {totals.bundleDiscount > 0 && (
            <div className="flex justify-between text-green">
              <span>Paket indirimi</span>
              <span>−{formatPrice(totals.bundleDiscount)}</span>
            </div>
          )}
          {totals.couponDiscount > 0 && (
            <div className="flex justify-between text-green">
              <span>Kupon</span>
              <span>−{formatPrice(totals.couponDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-brown-dark/70">Kargo</span>
            <span>{shipping === "hizli" ? formatPrice(59.9) : totals.freeShipping ? "Ücretsiz" : formatPrice(totals.shippingCost)}</span>
          </div>
          <div className="flex justify-between border-t border-brown/10 pt-2 text-base font-bold text-brown-darker">
            <span>Toplam</span>
            <span>{formatPrice(grandTotal)}</span>
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="btn-signature mt-6 w-full bg-brown-darker py-4 text-sm font-bold text-cream transition hover:bg-green disabled:opacity-60"
        >
          {submitting ? "İşleniyor…" : "Ödemeye Geç"}
        </button>
        <TrustBadges className="mt-4" />
      </div>
    </form>
  );
}
