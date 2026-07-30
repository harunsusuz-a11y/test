"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const STORAGE_KEY = "venti-exit-intent";
const SUPPRESS_DAYS = 7;
/** Sayfaya girişten itibaren bu süre dolmadan popup asla tetiklenmez. */
const MIN_DWELL_MS = 8000;

const schema = z.object({
  email: z.string().min(1, "E-posta adresi gerekli.").email("Geçerli bir e-posta adresi girin."),
  kvkk: z.literal(true, { errorMap: () => ({ message: "Devam etmek için onay vermelisiniz." }) }),
});
type FormValues = z.infer<typeof schema>;

function isSuppressed(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const until = Number(raw);
    return Number.isFinite(until) && Date.now() < until;
  } catch {
    return true; // storage okunamıyorsa riske girme, gösterme
  }
}

function suppress() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now() + SUPPRESS_DAYS * 24 * 60 * 60 * 1000));
  } catch {
    /* no-op */
  }
}

/**
 * Sitedeki TEK popup. Kullanıcı ayrılma niyeti gösterdiğinde bir kez açılır:
 * - Desktop: imleç viewport'un üstünden çıkarken (mouseleave, clientY <= 0)
 * - Mobil: sayfanın aşağısındayken hızlı yukarı kaydırma (adres çubuğuna yönelme sinyali)
 * Kapatılınca veya gönderilince 7 gün bastırılır. prefers-reduced-motion'da animasyonsuz açılır.
 */
export function ExitIntentPopup() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const firedRef = useRef(false);
  const mountedAtRef = useRef(0);
  const lastScrollRef = useRef({ y: 0, t: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const trigger = useCallback(() => {
    if (firedRef.current) return;
    if (Date.now() - mountedAtRef.current < MIN_DWELL_MS) return;
    if (isSuppressed()) return;
    firedRef.current = true;
    setOpen(true);
  }, []);

  useEffect(() => {
    mountedAtRef.current = Date.now();
    if (isSuppressed()) return;

    // Desktop: exit intent
    function onMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0) trigger();
    }
    // Mobil: sayfa aşağısında hızlı scroll-up
    function onScroll() {
      const now = performance.now();
      const y = window.scrollY;
      const prev = lastScrollRef.current;
      const dt = now - prev.t;
      const dy = prev.y - y; // pozitif = yukarı
      if (dt > 0 && dt < 120 && dy > 60 && y > window.innerHeight * 1.5) trigger();
      lastScrollRef.current = { y, t: now };
    }

    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [trigger]);

  const close = useCallback(() => {
    suppress();
    setOpen(false);
  }, []);

  // Açıkken: Escape ile kapat + odağı diyaloğa taşı
  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);


  async function onSubmit() {
    setStatus("loading");
    // NOT: Gerçek e-posta servisi (Klaviyo/Mailchimp vb.) henüz entegre edilmedi —
    // NewsletterForm ile aynı demo akış. Servis bağlanınca burası güncellenmeli.
    await new Promise((r) => setTimeout(r, 600));
    setStatus("success");
    suppress();
    setTimeout(() => setOpen(false), 2200);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
    >
      <button
        type="button"
        aria-label="Pencereyi kapat"
        onClick={close}
        className="absolute inset-0 bg-brown-darker/60 backdrop-blur-[2px] motion-safe:animate-[fadeIn_.3s_ease-out]"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-cream shadow-2xl shadow-brown-darker/30 outline-none motion-safe:animate-[popIn_.35s_cubic-bezier(.16,1,.3,1)]"
      >
        <div className="relative h-36">
          <Image
            src="/images/hand-bars.jpg"
            alt=""
            fill
            sizes="28rem"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/20 to-transparent" />
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Kapat"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-brown-darker/60 text-cream backdrop-blur-sm transition hover:bg-brown-darker"
        >
          <X size={16} aria-hidden="true" />
        </button>

        <div className="px-8 pb-8 pt-2 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest2 text-green">Gitmeden önce</p>
          <h2 id="exit-intent-title" className="mt-2 font-display text-2xl font-extrabold text-brown-darker">
            İlk kutuna %10 bizden.
          </h2>
          <p className="mt-2 text-sm text-brown-dark/70">
            E-postanı bırak, indirim kodun anında gelsin — yeni aromalardan da ilk sen haberdar ol.
          </p>

          {status === "success" ? (
            <p role="status" className="mt-6 rounded-xl bg-green/15 px-5 py-4 text-sm font-medium text-green">
              Kodun yolda — gelen kutunu kontrol et.
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 text-left">
              <label htmlFor="exit-email" className="sr-only">
                E-posta adresi
              </label>
              <input
                id="exit-email"
                type="email"
                placeholder="E-posta adresin"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "exit-email-error" : undefined}
                className="w-full rounded-full border border-brown/20 bg-white px-5 py-3 text-sm text-brown-darker outline-none focus-visible:border-green"
                {...register("email")}
              />
              {errors.email && (
                <p id="exit-email-error" className="mt-1.5 px-2 text-xs text-red-700">
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

              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-5 w-full rounded-full bg-brown-darker py-3.5 text-sm font-bold uppercase tracking-wide text-cream transition hover:bg-green disabled:opacity-60"
              >
                {status === "loading" ? "Gönderiliyor…" : "Kodu Gönder"}
              </button>
              <button
                type="button"
                onClick={close}
                className="mt-3 w-full text-center text-xs font-medium text-brown-dark/50 underline-offset-2 hover:underline"
              >
                Hayır, teşekkürler
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
