"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !kvkk) return;
    setStatus("loading");

    const res = await fetch("/api/email/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "homepage" }),
    });

    setStatus(res.ok ? "success" : "error");
    if (res.ok) setEmail("");
  }

  if (status === "success") {
    return (
      <p className="rounded-2xl bg-green/10 px-6 py-5 text-center text-sm font-semibold text-green">
        Aramıza katıldın! Yeni aromalara ilk sen ulaşacaksın.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex-1">
        <label htmlFor="newsletter-email" className="sr-only">E-posta adresi</label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresin"
          autoComplete="email"
          required
          className="w-full rounded-full border border-brown/20 bg-white px-5 py-3 text-sm text-brown-darker outline-none focus-visible:border-green"
          aria-invalid={status === "error"}
          name="email"
        />
        <label className="mt-3 flex items-start gap-2 px-2 text-xs text-brown-dark/70">
          <input type="checkbox" checked={kvkk} onChange={(e) => setKvkk(e.target.checked)} className="mt-0.5" name="kvkk" required />
          <span>
            Kişisel verilerimin KVKK kapsamında işlenmesini kabul ediyorum.{" "}
            <a href="/kvkk" className="underline hover:text-green">KVKK Metni</a>
          </span>
        </label>
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-brown px-7 py-3 text-sm font-bold text-cream transition hover:bg-green disabled:opacity-60"
      >
        {status === "loading" ? "Kaydediliyor…" : "Katıl"}
      </button>
      {status === "error" && <p className="mt-1 text-xs text-red-600 sm:hidden">Bir hata oluştu, tekrar dene.</p>}
    </form>
  );
}
