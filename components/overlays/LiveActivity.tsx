"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Activity = {
  id: string;
  city: string;
  product: string;
  time: string;
};

function timeAgo(ms: number): string {
  if (ms < 60000) return "az önce";
  if (ms < 3600000) return `${Math.floor(ms / 60000)} dk önce`;
  return `${Math.floor(ms / 3600000)} sa önce`;
}

const CITIES = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep"];

export function LiveActivity() {
  const [current, setCurrent] = useState<Activity | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Gerçek sipariş verisi dinle
    const channel = supabase
      .channel("live-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = payload.new as { full_name?: string; city?: string; created_at?: string };
          const city = order.city || CITIES[Math.floor(Math.random() * CITIES.length)];
          show({ city, product: "Venti-Ate ürünü", createdAt: order.created_at ?? new Date().toISOString() });
        }
      )
      .subscribe();

    // İlk yüklemede son 1 saatin siparişlerinden birini göster
    supabase
      .from("orders")
      .select("city, created_at")
      .gte("created_at", new Date(Date.now() - 3600000).toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const o = data[0] as { city?: string; created_at?: string };
          setTimeout(() => {
            show({
              city: o.city || CITIES[Math.floor(Math.random() * CITIES.length)],
              product: "Venti-Ate ürünü",
              createdAt: o.created_at ?? new Date().toISOString(),
            });
          }, 4000);
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  function show({ city, product, createdAt }: { city: string; product: string; createdAt: string }) {
    const elapsed = Date.now() - new Date(createdAt).getTime();
    setCurrent({ id: Math.random().toString(), city, product, time: timeAgo(elapsed) });
    setVisible(true);
    setTimeout(() => setVisible(false), 5000);
  }

  if (!current || !visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-2xl border border-brown/10 bg-cream px-4 py-3 shadow-lg shadow-brown-darker/10 motion-safe:animate-[fadeIn_.3s_ease-out]"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green/15 text-sm">🌰</span>
      <div>
        <p className="text-xs font-semibold text-brown-darker">
          {current.city}&apos;den biri sipariş verdi
        </p>
        <p className="text-[10px] text-brown-dark/50">{current.time}</p>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Kapat"
        className="ml-2 text-brown-dark/30 hover:text-brown-dark"
      >
        ×
      </button>
    </div>
  );
}
