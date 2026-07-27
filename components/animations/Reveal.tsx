"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Yeniden kullanılabilir scroll-reveal sarmalayıcısı.
 * Görünür alana girince yumuşak yukarı kayma + fade uygular; bir kez çalışır.
 * prefers-reduced-motion'da animasyonsuz, doğrudan görünür başlar.
 * GSAP yerine bilinçli olarak IO + CSS transition: sayfa başına onlarca
 * reveal olabilir, bu desen sıfır ek bağımlılıkla en ucuz yoldur.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  /** ms cinsinden gecikme — kart gridlerinde kademeli giriş için */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : undefined }}
      className={`transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none ${
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
