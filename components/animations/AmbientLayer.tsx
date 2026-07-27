"use client";

import { useEffect, useState } from "react";

/**
 * Site geneli tek bir ortak "ambient" efekt katmanı: çok düşük yoğunlukta
 * grain + birkaç yavaş süzülen toz parçacığı. Tamamen CSS/SVG tabanlı —
 * WebGL kullanmaz, GPU maliyeti ihmal edilebilir düzeydedir.
 *
 * Kurallar (spec'e uygun):
 * - Grain opacity çok düşük (0.03)
 * - Metin okunabilirliğini bozmaz (pointer-events-none, fixed, z-index düşük)
 * - prefers-reduced-motion açıkken parçacık animasyonu durur, sade grain kalır
 * - Mobilde parçacık sayısı azaltılır
 */
export function AmbientLayer() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [particleCount, setParticleCount] = useState(6);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setParticleCount(window.matchMedia("(min-width: 768px)").matches ? 6 : 3);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      <svg className="absolute inset-0 h-full w-full opacity-[0.03]">
        <filter id="ambient-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ambient-grain)" />
      </svg>

      {!reducedMotion &&
        Array.from({ length: particleCount }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-peach/25"
            style={{
              width: 3 + (i % 3),
              height: 3 + (i % 3),
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animation: `venti-dust-float ${18 + i * 4}s ease-in-out ${i}s infinite`,
            }}
          />
        ))}

      <style>{`
        @keyframes venti-dust-float {
          0% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 0.6; }
          50% { transform: translate(12px, -60px); }
          90% { opacity: 0.4; }
          100% { transform: translate(-8px, -120px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
