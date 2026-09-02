"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ürün detayın imza efekti: %protein / %fındık oranını gösteren,
 * görünür alana girince dolan SVG halkalar + sayaç.
 * Veri content/products.ts'ten gelir (proteinPercent / hazelnutPercent) —
 * uydurma değer basılmaz; tanımsız alan render edilmez.
 * prefers-reduced-motion'da animasyonsuz, dolu halde başlar.
 */
type Stat = { label: string; percent: number };

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DURATION_MS = 1400;

function Ring({ stat, animate }: { stat: Stat; animate: boolean }) {
  const [value, setValue] = useState(animate ? 0 : stat.percent);

  useEffect(() => {
    if (!animate) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      // easeOutExpo — sonlara doğru yavaşlayan premium sayaç hissi
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(Math.round(stat.percent * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, stat.percent]);

  const offset = CIRCUMFERENCE * (1 - value / 100);

  return (
    <figure className="flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="h-24 w-24 sm:h-28 sm:w-28" role="img" aria-label={`${stat.label}: yüzde ${stat.percent}`}>
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="currentColor" strokeWidth="6" className="text-brown/10" />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          className="text-green"
        />
        <text x="50" y="54" textAnchor="middle" className="fill-current font-display text-[22px] font-bold text-brown-darker">
          %{value}
        </text>
      </svg>
      <figcaption className="mt-2 text-[11px] font-bold uppercase tracking-widest2 text-brown-dark/60">
        {stat.label}
      </figcaption>
    </figure>
  );
}

export function StatRings({
  proteinPercent,
  hazelnutPercent,
}: {
  proteinPercent?: number;
  hazelnutPercent?: number;
}) {
  const stats: Stat[] = [
    ...(proteinPercent ? [{ label: "Protein", percent: proteinPercent }] : []),
    ...(hazelnutPercent ? [{ label: "Fındık Oranı", percent: hazelnutPercent }] : []),
  ];
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReady(true);
      return; // animate=false → halkalar dolu başlar
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
          setReady(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    setReady(true);
    return () => observer.disconnect();
  }, []);

  if (stats.length === 0) return null;

  return (
    <div ref={ref} className="mt-8 flex gap-8 rounded-2xl border border-brown/10 bg-white/60 px-6 py-5">
      {ready && stats.map((s) => <Ring key={s.label} stat={s} animate={animate} />)}
      <div className="hidden flex-1 items-center sm:flex">
        <p className="text-xs leading-relaxed text-brown-dark/60">
          Oranlar ürün formülasyonuna dayanır; kesin değerler resmi etiketle netleşecektir.
        </p>
      </div>
    </div>
  );
}
