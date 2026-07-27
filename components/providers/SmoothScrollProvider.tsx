"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Lenis (https://github.com/darkroomengineering/lenis) ile yumuşak scroll.
 * GSAP ScrollTrigger ile resmi entegrasyon deseni kullanılıyor:
 * https://gsap.com/resources/Lenis (Lenis'in kendi dokümantasyonundaki GSAP tarifi)
 *
 * prefers-reduced-motion açıksa Lenis hiç başlatılmaz — tarayıcının doğal
 * scroll'u (ve dolayısıyla erişilebilirlik) korunur.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
    };
  }, []);

  return <>{children}</>;
}
