"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatPrice } from "@/lib/utils/format";

type Order = {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  full_name: string;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Beklemede",
  confirmed: "Onaylandı",
  shipped: "Kargoya Verildi",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green/10 text-green",
  cancelled: "bg-red-100 text-red-700",
};

export function OrdersClient() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push("/uye-giris"); return; }
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, status, total_amount, created_at, full_name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data ?? []);
      setLoading(false);
    });
  }, [router]);

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><p className="text-brown-dark/60">Yükleniyor…</p></div>;

  return (
    <>
      <PageHeader eyebrow="Hesabım" title="Siparişlerim" />
      <div className="mx-auto max-w-3xl px-5 py-16">
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-brown/10 bg-white/70 p-12 text-center">
            <p className="text-brown-dark/60">Henüz siparişin yok.</p>
            <Link href="/magaza" className="mt-6 inline-block rounded-full bg-brown-darker px-7 py-3 text-sm font-bold text-cream transition hover:bg-green">
              Mağazaya Git
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-brown/10 bg-white/70 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display font-bold text-brown-darker">{order.order_number}</p>
                    <p className="mt-1 text-sm text-brown-dark/60">
                      {new Date(order.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[order.status] ?? "bg-brown/10 text-brown-dark"}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                    <p className="mt-2 font-bold text-brown-darker">{formatPrice(order.total_amount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
