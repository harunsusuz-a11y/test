"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

const SLIDES = [
  {
    image: "/images/hero-bars.jpg",
    eyebrow: "Yeni Sezon",
    title: "Fındığın\nRafine Hali",
    subtitle: "Giresun fındığıyla hazırlanan, %25 proteinli bar ve kremalar.",
    cta: { label: "Keşfet", href: "/magaza" },
    align: "left" as const,
  },
  {
    image: "/images/boxes-left.jpg",
    eyebrow: "Protein Bar",
    title: "Tiramisu &\nKakao Bar",
    subtitle: "Antrenman öncesi ve sonrası için gerçek fındık, gerçek protein.",
    cta: { label: "Barları İncele", href: "/magaza/kategori/protein-bar" },
    align: "center" as const,
  },
  {
    image: "/images/cream-pour.jpg",
    eyebrow: "Fındık Kreması",
    title: "%50 Fındık\nOranı",
    subtitle: "Palm yağı yok, dolgu maddesi yok. Sadece fındık.",
    cta: { label: "Kremayı Gör", href: "/magaza/kategori/findik-kremasi" },
    align: "right" as const,
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const go = useCallback((idx: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(idx);
      setTransitioning(false);
    }, 400);
  }, [transitioning]);

  useEffect(() => {
    const t = setInterval(() => go((current + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [current, go]);

  const slide = SLIDES[current];
  const alignClass = slide.align === "center" ? "items-center text-center" : slide.align === "right" ? "items-end text-right" : "items-start text-left";

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden bg-[#2a1a10]">
      {/* Görseller */}
      {SLIDES.map((s, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}>
          <Image src={s.image} alt={s.title} fill priority={i === 0}
            sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f08]/80 via-[#1a0f08]/30 to-transparent" />
        </div>
      ))}

      {/* İçerik */}
      <div className={`absolute inset-0 flex flex-col justify-end px-8 pb-24 md:px-20 md:pb-32 ${alignClass}`}
        style={{ opacity: transitioning ? 0 : 1, transition: "opacity 0.4s" }}>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#F9C89E]">
          {slide.eyebrow}
        </p>
        <h1 className="font-display mb-4 whitespace-pre-line text-4xl font-bold leading-tight text-[#FFF6F0] md:text-6xl lg:text-7xl">
          {slide.title}
        </h1>
        <p className="mb-8 max-w-md text-sm text-[#FFF6F0]/75 md:text-base">{slide.subtitle}</p>
        <Link href={slide.cta.href}
          className="inline-flex items-center gap-2 self-start rounded-none bg-[#F9C89E] px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#2D1A0E] transition-all hover:bg-[#FFF6F0]"
          style={{ clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)" }}>
          {slide.cta.label} →
        </Link>
      </div>

      {/* Sayaç + noktalar */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-4">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => go(i)}
            className={`h-0.5 transition-all duration-500 ${i === current ? "w-10 bg-[#F9C89E]" : "w-4 bg-[#FFF6F0]/30"}`} />
        ))}
      </div>

      {/* Slide numarası */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 text-xs text-[#FFF6F0]/40">
        <span className="text-[#F9C89E]">{String(current + 1).padStart(2, "0")}</span>
        <div className="h-12 w-px bg-[#FFF6F0]/20 self-center" />
        <span>{String(SLIDES.length).padStart(2, "0")}</span>
      </div>
    </section>
  );
}
