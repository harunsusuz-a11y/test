"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";

const SESSION_KEY = "venti-sub-toast-shown";

/**
 * Kullanıcı ana sayfada ScrollStory'yi bitirip ürünlere ulaştığında
 * köşede bir kez beliren küçük abonelik hatırlatması. Popup değildir,
 * içeriği kapatmaz; oturum başına bir kez gösterilir.
 * observeId: görünür olduğunda toast'u tetikleyecek bölümün id'si.
 */
export function SubscriptionToast({ observeId = "urun-ailesi" }: { observeId?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      return;
    }
    const target = document.getElementById(observeId);
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            /* no-op */
          }
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [observeId]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="fixed bottom-5 left-5 z-[70] w-[calc(100%-2.5rem)] max-w-xs rounded-2xl border border-brown/10 bg-cream p-4 shadow-xl shadow-brown-darker/15 motion-safe:animate-[slideInUp_.4s_cubic-bezier(.16,1,.3,1)]"
    >
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Bildirimi kapat"
        className="absolute right-2.5 top-2.5 rounded-full p-1 text-brown-dark/50 transition hover:text-brown-darker"
      >
        <X size={14} aria-hidden="true" />
      </button>
      <div className="flex items-start gap-3">
        <span className="rounded-full bg-green/10 p-2 text-green">
          <RefreshCw size={16} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-brown-darker">Abonelikte her kutu %10 indirimli</p>
          <p className="mt-1 text-xs leading-relaxed text-brown-dark/70">
            İstediğin sıklıkta kapına gelsin, dilediğin zaman durdur.
          </p>
          <Link
            href="/abonelik"
            onClick={() => setVisible(false)}
            className="mt-2 inline-block text-xs font-bold text-green underline-offset-2 hover:underline"
          >
            Aboneliği keşfet →
          </Link>
        </div>
      </div>
    </div>
  );
}
