"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Özel cursor sistemi — yalnızca masaüstü + fare (touch/coarse pointer'da
 * hiç render edilmez, gerçek sistem cursor'u korunur). Hover edilen
 * elemanın en yakın `data-cursor-text` attribute'una göre etiket gösterir
 * ("İncele", "Kaydır", "Keşfet"); buton/link üzerinde hafifçe büyür.
 *
 * Performans: pozisyon güncellemesi React state değil, doğrudan ref/style
 * üzerinden yapılır (her hareket için re-render yok).
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [big, setBig] = useState(false);

  useEffect(() => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isFinePointer || reducedMotion) return;
    setEnabled(true);

    function onMove(e: PointerEvent) {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
      const target = e.target as HTMLElement | null;
      const withText = target?.closest<HTMLElement>("[data-cursor-text]");
      setLabel(withText?.dataset.cursorText ?? null);
      setBig(Boolean(target?.closest("a, button")));
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[90] flex items-center justify-center rounded-full bg-brown-darker/90 text-[10px] font-bold uppercase tracking-wide text-cream transition-[width,height] duration-150"
      style={{
        width: label ? 64 : big ? 14 : 8,
        height: label ? 64 : big ? 14 : 8,
        marginLeft: label ? -32 : big ? -7 : -4,
        marginTop: label ? -32 : big ? -7 : -4,
      }}
    >
      {label}
    </div>
  );
}
