"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "genel-bakis", label: "Genel Bakış" },
  { id: "hikaye", label: "Hikâye" },
  { id: "besin", label: "Besin" },
  { id: "yorumlar", label: "Yorumlar" },
  { id: "sss", label: "SSS" },
] as const;

/**
 * Header'ın altına yapışan sayfa içi bölüm navigasyonu.
 * IntersectionObserver ile aktif bölüm takip edilir (scrollspy);
 * tıklamalar tarayıcının yerel anchor davranışıyla (Lenis smooth) çalışır.
 */
export function ProductNav({ accentBg }: { accentBg: string }) {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        // Aktif sayılma bandı: viewport'un üst yarısı
        { rootMargin: "-35% 0px -55% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <nav
      aria-label="Ürün sayfası bölümleri"
      className="sticky top-[72px] z-40 border-b border-brown/10 bg-cream/90 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5">
        {SECTIONS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={active === id ? "true" : undefined}
            className={`relative whitespace-nowrap px-4 py-3.5 text-xs font-bold uppercase tracking-wide transition-colors ${
              active === id ? "text-brown-darker" : "text-brown-dark/50 hover:text-brown-darker"
            }`}
          >
            {label}
            <span
              aria-hidden="true"
              className={`absolute inset-x-4 bottom-0 h-0.5 rounded-full transition-all duration-300 ${
                active === id ? `${accentBg} opacity-100` : "opacity-0"
              }`}
            />
          </a>
        ))}
      </div>
    </nav>
  );
}
