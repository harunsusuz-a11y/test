"use client";

import { useEffect, useState } from "react";
import { brand } from "@/content/brand";

const SESSION_KEY = "venti-ate-intro-seen";

export function IntroSplash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadySeen = sessionStorage.getItem(SESSION_KEY);

    if (reducedMotion || alreadySeen) return;

    setVisible(true);
    sessionStorage.setItem(SESSION_KEY, "1");

    const timeout = setTimeout(() => setVisible(false), 1400);
    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brown-darker"
      style={{ animation: "venti-intro-fade 1.4s ease forwards" }}
    >
      <p className="animate-pulse font-display text-3xl font-extrabold tracking-widest2 text-cream">
        {brand.name}
      </p>
      <style>{`
        @keyframes venti-intro-fade {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; visibility: hidden; }
        }
      `}</style>
    </div>
  );
}
