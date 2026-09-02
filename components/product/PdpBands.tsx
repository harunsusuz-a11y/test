import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProductTheme } from "@/lib/utils/product-theme";

/**
 * Bölüm arası dev outline tipografi şeridi: ürün adı içi boş harflerle akar.
 * Dekoratiftir (aria-hidden); reduced-motion'da animasyon globals.css'te durur.
 */
export function OutlineMarquee({ text, theme }: { text: string; theme: ProductTheme }) {
  const items = Array.from({ length: 6 }, () => text);
  return (
    <div aria-hidden="true" className="select-none overflow-hidden border-y border-brown/10 py-4">
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
        {[0, 1].map((half) => (
          <span key={half} className="flex gap-12">
            {items.map((t, i) => (
              <span
                key={`${half}-${i}`}
                className="font-display text-5xl font-bold uppercase tracking-tight sm:text-6xl"
                style={{ WebkitTextStroke: `1.5px ${theme.strokeColor}`, color: "transparent" }}
              >
                {t}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Kapanış CTA bandı: Benzer Ürünler'den önce tam genişlik, koyu zeminli
 * "Formunu Bul" quiz'ine yönlendirme. Quiz zaten sitede var — PDP'den trafik akıtır.
 */
export function QuizCta({ theme }: { theme: ProductTheme }) {
  return (
    <section className={`${theme.heroBg} text-cream`}>
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-16 sm:flex-row sm:items-center">
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest2 ${theme.accentText}`}>Kararsız mısın?</p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Hangi aroma sana göre?</h2>
          <p className="mt-2 max-w-md text-cream/70">
            1 dakikalık Formunu Bul testiyle antrenman ritmine ve damak zevkine uygun ürünü bul.
          </p>
        </div>
        <Link
          href="/formunu-bul"
          className={`btn-signature group flex shrink-0 items-center gap-2 px-8 py-4 text-sm font-bold text-brown-darker transition hover:brightness-95 active:scale-[0.98] ${theme.accentBg}`}
        >
          Formunu Bul
          <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
