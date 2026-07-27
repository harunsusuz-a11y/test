"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";

/**
 * "Az önce sipariş verildi" tarzı canlı aktivite bildirimi.
 *
 * ÖNEMLİ — ETİK/HUKUKİ NOT:
 * Bu bileşen SAHTE/uydurma sipariş verisiyle KULLANILMAMALIDIR. Uydurma
 * sosyal kanıt, tüketiciyi yanıltıcı ticari uygulama sayılır (TR'de TKHK ve
 * Ticari Reklam Yönetmeliği kapsamında risklidir) ve marka güvenini zedeler.
 *
 * Bu yüzden:
 * 1) Varsayılan olarak KAPALIDIR (NEXT_PUBLIC_LIVE_ACTIVITY !== "true").
 * 2) Veri kaynağı boştur — gerçek sipariş akışı (Supabase orders tablosu,
 *    yalnızca isim baş harfi + şehir gibi anonimleştirilmiş alanlarla)
 *    bağlandığında `fetchRecentActivity` doldurulmalıdır.
 */
type ActivityItem = {
  /** Ör. "A***" — asla tam isim gösterme (KVKK) */
  maskedName: string;
  city: string;
  productName: string;
  /** Ör. "5 dk önce" */
  timeAgo: string;
};

async function fetchRecentActivity(): Promise<ActivityItem[]> {
  // TODO: Supabase orders tablosundan son (onaylı) siparişleri, anonimleştirilmiş
  // olarak dönen bir API route'a bağla (ör. /api/recent-activity).
  // Gerçek veri yoksa boş dizi dön — bileşen hiçbir şey göstermez.
  return [];
}

export function LiveActivity() {
  const enabled = process.env.NEXT_PUBLIC_LIVE_ACTIVITY === "true";
  const [item, setItem] = useState<ActivityItem | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetchRecentActivity().then((items) => {
      if (!cancelled && items.length > 0) setItem(items[0]);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!enabled || !item) return null;

  return (
    <div
      role="status"
      className="fixed bottom-5 right-5 z-[70] flex max-w-xs items-center gap-3 rounded-2xl border border-brown/10 bg-cream p-4 shadow-xl shadow-brown-darker/15 motion-safe:animate-[slideInUp_.4s_cubic-bezier(.16,1,.3,1)]"
    >
      <span className="rounded-full bg-green/10 p-2 text-green">
        <ShoppingBag size={16} aria-hidden="true" />
      </span>
      <p className="text-xs leading-relaxed text-brown-dark/80">
        <span className="font-semibold text-brown-darker">
          {item.city}&apos;den {item.maskedName}
        </span>{" "}
        {item.timeAgo} <span className="font-semibold">{item.productName}</span> sipariş etti.
      </p>
    </div>
  );
}
