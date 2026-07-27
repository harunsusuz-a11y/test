"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().min(1, "E-posta adresi gerekli.").email("Geçerli bir e-posta adresi girin."),
  kvkk: z.literal(true, { errorMap: () => ({ message: "Devam etmek için onay vermelisiniz." }) }),
});

type FormValues = z.infer<typeof schema>;

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit() {
    setStatus("loading");
    try {
      // NOT: Gerçek bir e-posta servisi (ör. Klaviyo, Mailchimp) henüz entegre edilmedi.
      // Bu demo akış 600ms bekleyip başarı durumunu simüle eder.
      await new Promise((resolve) => setTimeout(resolve, 600));
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p role="status" className="rounded-xl bg-green/15 px-5 py-4 text-sm font-medium text-green">
        Kaydın alındı — ilk ısırık sana özel haberlerle yolda.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex-1">
        <label htmlFor="newsletter-email" className="sr-only">
          E-posta adresi
        </label>
        <input
          id="newsletter-email"
          type="email"
          placeholder="E-posta adresin"
          autoComplete="email"
          className="w-full rounded-full border border-brown/20 bg-white px-5 py-3 text-sm text-brown-darker outline-none focus-visible:border-green"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "newsletter-email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p id="newsletter-email-error" className="mt-1.5 px-2 text-xs text-red-700">
            {errors.email.message}
          </p>
        )}

        <label className="mt-3 flex items-start gap-2 px-2 text-xs text-brown-dark/70">
          <input type="checkbox" className="mt-0.5" {...register("kvkk")} />
          <span>
            Kişisel verilerimin KVKK kapsamında işlenmesini kabul ediyorum.{" "}
            <span className="text-brown-dark/50">[KVKK metni linki eklenecek]</span>
          </span>
        </label>
        {errors.kvkk && <p className="mt-1 px-2 text-xs text-red-700">{errors.kvkk.message}</p>}
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-brown px-7 py-3 text-sm font-bold text-cream transition hover:bg-green disabled:opacity-60"
      >
        {status === "loading" ? "Gönderiliyor…" : "Katıl"}
      </button>

      {status === "error" && (
        <p role="alert" className="text-xs text-red-700">
          Bir şeyler ters gitti, tekrar dener misin?
        </p>
      )}
    </form>
  );
}
