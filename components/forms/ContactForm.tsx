"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Adınızı girin."),
  email: z.string().min(1, "E-posta adresi gerekli.").email("Geçerli bir e-posta adresi girin."),
  message: z.string().min(10, "Mesajınız en az 10 karakter olmalı."),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm() {
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
      // NOT: Gerçek bir destek/CRM entegrasyonu henüz bağlanmadı — demo gönderim.
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
        Mesajın bize ulaştı, en kısa sürede dönüş yapacağız.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-brown-darker">
          Ad Soyad
        </label>
        <input
          id="contact-name"
          className="w-full rounded-xl border border-brown/20 bg-white px-4 py-3 text-sm outline-none focus-visible:border-green"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-brown-darker">
          E-posta
        </label>
        <input
          id="contact-email"
          type="email"
          className="w-full rounded-xl border border-brown/20 bg-white px-4 py-3 text-sm outline-none focus-visible:border-green"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-brown-darker">
          Mesajınız
        </label>
        <textarea
          id="contact-message"
          rows={5}
          className="w-full rounded-xl border border-brown/20 bg-white px-4 py-3 text-sm outline-none focus-visible:border-green"
          aria-invalid={!!errors.message}
          {...register("message")}
        />
        {errors.message && <p className="mt-1 text-xs text-red-700">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-brown px-7 py-3 text-sm font-bold text-cream transition hover:bg-green disabled:opacity-60"
      >
        {status === "loading" ? "Gönderiliyor…" : "Gönder"}
      </button>

      {status === "error" && (
        <p role="alert" className="text-xs text-red-700">
          Bir şeyler ters gitti, tekrar dener misin?
        </p>
      )}
    </form>
  );
}
