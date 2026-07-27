"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { brand } from "@/content/brand";

const SESSION_KEY = "venti-ate-intro-seen";

/**
 * Açılış animasyonu: koyu ekranda tek bir "fındık" şekli belirir, kontrollü
 * şekilde döner/büyür, ardından marka wordmark'ına geçiş yapar (opacity
 * cross-fade). GSAP timeline (https://github.com/greensock/GSAP) ile
 * yönetilir. prefers-reduced-motion açıksa hiç render edilmez; aynı
 * oturumda tekrar oynatılmaz; ana içeriği bloklamaz (fixed overlay).
 */
export function IntroSplash() {
  const [visible, setVisible] = useState(false);
  const nutRef = useRef<SVGSVGElement>(null);
  const wordmarkRef = useRef<HTMLParagraphElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadySeen = sessionStorage.getItem(SESSION_KEY);
    if (reducedMotion || alreadySeen) return;

    setVisible(true);
    sessionStorage.setItem(SESSION_KEY, "1");
  }, []);

  useEffect(() => {
    if (!visible || !nutRef.current || !wordmarkRef.current || !overlayRef.current) return;

    const tl = gsap.timeline({
      onComplete: () => setVisible(false),
    });

    tl.set(nutRef.current, { scale: 0.3, opacity: 0, rotate: -30 })
      .set(wordmarkRef.current, { opacity: 0, y: 8 })
      .to(nutRef.current, { opacity: 1, scale: 1, rotate: 360, duration: 0.9, ease: "power3.out" })
      .to(nutRef.current, { scale: 0.7, opacity: 0, duration: 0.4, ease: "power2.in" }, "+=0.1")
      .to(wordmarkRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "<")
      .to(wordmarkRef.current, { opacity: 1, duration: 0.5 })
      .to(overlayRef.current, { opacity: 0, duration: 0.5, ease: "power2.inOut" });

    return () => {
      tl.kill();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brown-darker"
    >
      <svg
        ref={nutRef}
        viewBox="0 0 100 100"
        className="absolute h-16 w-16"
        style={{ transformOrigin: "50% 50%" }}
      >
        <ellipse cx="50" cy="55" rx="32" ry="38" fill="#F9C89E" />
        <path d="M50 17 C60 17 68 26 68 36 L32 36 C32 26 40 17 50 17 Z" fill="#415D1F" />
      </svg>
      <p
        ref={wordmarkRef}
        className="font-display text-3xl font-extrabold tracking-widest2 text-cream"
      >
        {brand.name}
      </p>
    </div>
  );
}
