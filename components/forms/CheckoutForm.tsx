"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils/format";

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
});

type FormValues = z.infer<typeof schema>;

export function CheckoutForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const lines = useCartStore((s) => s.lines);
  const subtotal = useCartStore((s) => s.subtotal());
  const clear = useCartStore((s) => s.clear);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { shipping: "standart", billingSame: true },
  });

  const shipping = watch("shipping");
  const shippingCost = shipping === "hizli" ? 59.9 : subtotal >= 300 ? 0 : 29.9;

  async function onSubmit() {
    setSubmitting(true);
    // NOT: Gerçek bir ödeme sağlayıcısı henüz entegre edilmedi.
    // Bu, soyut bir "ödeme katmanı" simülasyonudur — gerçek para hareketi yoktur.
    await new Promise((resolve) => setTimeout(resolve, 900));
    clear();
    router.push("/siparis-basarili");
  }

  if (lines.length === 0) {
    return <p className="text-brown-dark/70">Sepetin boş — ödemeye geçmeden önce ürün eklemelisin.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-10 md:grid-cols-3">
      <div className="space-y-6 md:col-span-2">
        <div
          role="note"
          className="rounded-xl border border-peach/60 bg-peach/15 px-5 py-4 text-sm text-brown-dark"
        >
          <strong>Demo Ödeme:</strong> Bu, gerçek bir ödeme sağlayıcısına bağlı değildir. Kredi kartı bilgisi
          istenmez ve gerçek bir tahsilat yapılmaz.
        </div>

        <fieldset className="space-y-4">
          <legend className="mb-1 font-display text-lg font-bold text-brown-darker">İletişim ve Teslimat</legend>

          <div>
            <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium">
              Ad Soyad
            </label>
            <input id="fullName" className="w-full rounded-xl border border-brown/20 px-4 py-3 text-sm" {...register("fullName")} />
            {errors.fullName && <p className="mt-1 text-xs text-red-700">{errors.fullName.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                E-posta
              </label>
              <input id="email" type="email" className="w-full rounded-xl border border-brown/20 px-4 py-3 text-sm" {...register("email")} />
              {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
                Telefon
              </label>
              <input id="phone" className="w-full rounded-xl border border-brown/20 px-4 py-3 text-sm" {...register("phone")} />
              {errors.phone && <p className="mt-1 text-xs text-red-700">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="address" className="mb-1.5 block text-sm font-medium">
              Adres
            </label>
            <textarea id="address" rows={3} className="w-full rounded-xl border border-brown/20 px-4 py-3 text-sm" {...register("address")} />
            {errors.address && <p className="mt-1 text-xs text-red-700">{errors.address.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="city" className="mb-1.5 block text-sm font-medium">
                Şehir
              </label>
              <input id="city" className="w-full rounded-xl border border-brown/20 px-4 py-3 text-sm" {...register("city")} />
              {errors.city && <p className="mt-1 text-xs text-red-700">{errors.city.message}</p>}
            </div>
            <div>
              <label htmlFor="postalCode" className="mb-1.5 block text-sm font-medium">
                Posta Kodu
              </label>
              <input id="postalCode" className="w-full rounded-xl border border-brown/20 px-4 py-3 text-sm" {...register("postalCode")} />
              {errors.postalCode && <p className="mt-1 text-xs text-red-700">{errors.postalCode.message}</p>}
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-display text-lg font-bold text-brown-darker">Kargo Seçimi</legend>
          <div className="space-y-2">
            <label className="flex items-center justify-between rounded-xl border border-brown/20 px-4 py-3 text-sm">
              <span className="flex items-center gap-2">
                <input type="radio" value="standart" {...register("shipping")} /> Standart Kargo (2-4 iş günü)
              </span>
              <span className="font-semibold">{subtotal >= 300 ? "Ücretsiz" : formatPrice(29.9)}</span>
            </label>
            <label className="flex items-center justify-between rounded-xl border border-brown/20 px-4 py-3 text-sm">
              <span className="flex items-center gap-2">
                <input type="radio" value="hizli" {...register("shipping")} /> Hızlı Kargo (1 iş günü)
              </span>
              <span className="font-semibold">{formatPrice(59.9)}</span>
            </label>
          </div>
        </fieldset>

        <label className="flex items-start gap-2 text-xs text-brown-dark/70">
          <input type="checkbox" className="mt-0.5" {...register("agreement")} />
          <span>
            <a href="/mesafeli-satis" className="underline">
              Mesafeli Satış Sözleşmesi
            </a>
            'ni ve{" "}
            <a href="/on-bilgilendirme" className="underline">
              Ön Bilgilendirme Formu
            </a>
            'nu okudum, kabul ediyorum.
          </span>
        </label>
        {errors.agreement && <p className="text-xs text-red-700">{errors.agreement.message}</p>}
      </div>

      <div className="h-fit rounded-2xl bg-white/60 p-6">
        <h2 className="font-display text-lg font-bold text-brown-darker">Sipariş Özeti</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {lines.map((line) => (
            <li key={line.slug} className="flex justify-between">
              <span>
                {line.name} × {line.quantity}
              </span>
              <span className="font-semibold">{formatPrice(line.price * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-brown/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Ara Toplam</dt>
            <dd className="font-semibold">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Kargo</dt>
            <dd className="font-semibold">{shippingCost === 0 ? "Ücretsiz" : formatPrice(shippingCost)}</dd>
          </div>
          <div className="flex justify-between border-t border-brown/10 pt-2 text-base font-bold text-brown-darker">
            <dt>Genel Toplam</dt>
            <dd>{formatPrice(subtotal + shippingCost)}</dd>
          </div>
        </dl>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-full bg-brown px-7 py-3.5 text-sm font-bold text-cream transition hover:bg-green disabled:opacity-60"
        >
          {submitting ? "İşleniyor…" : "Siparişi Tamamla (Demo)"}
        </button>
      </div>
    </form>
  );
}
