"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "venti-announcement-dismissed-v1";

/**
 * Header üstünde ince, kapatılabilir duyuru barı.
 * Premium markalarda giriş popup'ı yerine tercih edilen desen:
 * teklifi gösterir ama deneyimin önüne bariyer koymaz.
 * Kapatıldığında localStorage ile bir daha gösterilmez
 * (kampanya değişince STORAGE_KEY sürümünü artırın).
 */
export function AnnouncementBar() {
  // SSR/hydration uyumu için başlangıçta gizli; mount'ta karar verilir.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage kapalıysa sessizce geç */
    }
  }

  if (!visible) return null;

  return (
    <div className="relative z-40 bg-green text-cream">
      <p className="mx-auto max-w-6xl px-10 py-2 text-center text-[11px] font-semibold uppercase tracking-widest2 sm:text-xs">
        İlk siparişe %10 indirim — kod: <span className="text-peach">VENTI10</span>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Duyuruyu kapat"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-cream/70 transition hover:text-cream"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
