"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Sağ kenarda ince bir scroll progress çizgisi (yalnızca masaüstü).
 * Mobilde tamamen gizli (spec: "Mobilde yalnızca ince progress bar göster
 * veya tamamen kaldır" — burada kaldırma tercih edildi, ekstra bir UI
 * elemanı küçük ekranlarda dokunmatik hedeflerle çakışabileceği için).
 * Reduced motion'da renk geçişi anlık olur, kayma animasyonu yoktur.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    let raf = 0;
    function update() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const progress = scrollable > 0 ? doc.scrollTop / scrollable : 0;
      if (barRef.current) barRef.current.style.transform = `scaleY(${progress})`;
      raf = requestAnimationFrame(update);
    }
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-3 top-0 z-40 hidden h-screen w-[3px] sm:block"
    >
      <div className="h-full w-full bg-brown/10" />
      <div
        ref={barRef}
        className="absolute inset-x-0 top-0 h-full w-full origin-top bg-green"
        style={{ transform: "scaleY(0)", transition: reducedMotion ? "transform 0.1s linear" : undefined }}
      />
    </div>
  );
}
