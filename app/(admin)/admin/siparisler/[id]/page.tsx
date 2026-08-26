"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/ui/Toast";
import { SkeletonCard } from "@/components/admin/ui/Skeleton";
import {
  ArrowLeft, Package, Truck, CheckCircle, XCircle, RotateCcw,
  Save, Printer, Download, MapPin, Phone, Mail, Clock, User,
  ChevronRight, AlertTriangle,
} from "lucide-react";

type OrderItem = {
  id: string; product_name: string; quantity: number;
  unit_price: number; total_price: number;
  product_id: string | null; variant_label: string | null;
};

type StatusHistory = {
  id: string; new_status: string; changed_by: string | null; created_at: string; note: string | null;
};

type Order = {
  id: string; order_number: string; created_at: string; status: string;
  full_name: string; email: string; phone: string | null;
  address: string | null; city: string | null; district: string | null;
  postal_code: string | null;
  subtotal: number; discount_amount: number | null; shipping_cost: number;
  total: number; coupon_code: string | null; payment_status: string;
  tracking_number: string | null; shipping_company: string | null;
  notes: string | null; payment_method: string | null;
  order_items: OrderItem[];
  order_status_history: StatusHistory[];
};

const STATUS_FLOW = ["pending","confirmed","shipped","delivered"] as const;
const STATUS_LABELS: Record<string, string> = {
  pending: "Bekliyor", confirmed: "Onaylandı", shipped: "Kargoda",
  delivered: "Teslim Edildi", cancelled: "İptal",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};
const STATUS_ICONS: Record<string, React.FC<Record<string, unknown>>> = {
  pending: Clock, confirmed: CheckCircle,
  shipped: Truck, delivered: Package, cancelled: XCircle,
};

export default function SiparisDetayPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const _toast = useToast();
  const showToast = (msg: string, type: "success"|"error") => type === "success" ? _toast.success(msg) : _toast.error(msg);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trackingInput, setTrackingInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [creatingLabel, setCreatingLabel] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*,order_items(*),order_status_history(*)")
      .eq("id", id)
      .single();
    if (data) {
      setOrder(data as Order);
      setTrackingInput(data.tracking_number ?? "");
      setNoteInput(data.notes ?? "");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(newStatus: string) {
    if (!order) return;
    setSaving(true);
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", order.id);
    if (!error) {
      await supabase.from("order_status_history").insert({
        order_id: order.id, new_status: newStatus, changed_by: "admin",
      });
      showToast(`Durum güncellendi: ${STATUS_LABELS[newStatus]}`, "success");
      load();
    } else showToast(error.message, "error");
    setSaving(false);
  }

  async function saveTracking() {
    if (!order) return;
    const { error } = await supabase.from("orders").update({
      tracking_number: trackingInput || null,
      notes: noteInput || null,
    }).eq("id", order.id);
    if (error) showToast(error.message, "error");
    else showToast("Kaydedildi", "success");
  }

  async function createYurticiLabel() {
    if (!order) return;
    setCreatingLabel(true);
    const res = await fetch("/api/kargo/yurtici", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: order.id }),
    });
    const data = await res.json();
    if (data.tracking_number) {
      showToast(`Kargo etiketi oluşturuldu: ${data.tracking_number}`, "success");
      load();
    } else {
      showToast(data.error ?? "Etiket oluşturulamadı", "error");
    }
    setCreatingLabel(false);
  }

  function printInvoice() {
    if (!order) return;
    const w = window.open("", "_blank");
    if (!w) return;
    const fmt = (n: number) => `₺${n.toLocaleString("tr-TR")}`;
    w.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="utf-8"><title>Sipariş ${order.order_number}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:40px;color:#222;max-width:700px;margin:0 auto}
        h1{font-size:22px;margin-bottom:4px}
        .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}
        .total{font-weight:bold;font-size:16px}
        table{width:100%;border-collapse:collapse;margin:20px 0}
        th{text-align:left;padding:8px;background:#f5f5f5;font-size:13px}
        td{padding:8px;font-size:13px;border-bottom:1px solid #eee}
        .badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:12px;background:#e8f5e9;color:#2e7d32}
        @media print{button{display:none}}
      </style></head><body>
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div><h1>Venti-Ate</h1><p style="color:#888;font-size:13px">ventiate.com</p></div>
        <div style="text-align:right">
          <p style="font-size:18px;font-weight:bold">${order.order_number}</p>
          <p style="color:#888;font-size:12px">${new Date(order.created_at).toLocaleDateString("tr-TR")}</p>
          <span class="badge">${STATUS_LABELS[order.status] ?? order.status}</span>
        </div>
      </div>
      <hr style="margin:20px 0;border:none;border-top:2px solid #eee">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:20px">
        <div><p style="font-weight:bold;margin-bottom:8px">Müşteri</p>
          <p>${order.full_name}</p><p style="color:#888">${order.email}</p>
          ${order.phone ? `<p style="color:#888">${order.phone}</p>` : ""}
        </div>
        <div><p style="font-weight:bold;margin-bottom:8px">Teslimat Adresi</p>
          <p>${order.address ?? ""}</p>
          <p>${[order.district, order.city].filter(Boolean).join(", ")}</p>
          ${order.postal_code ? `<p>${order.postal_code}</p>` : ""}
        </div>
      </div>
      <table>
        <thead><tr><th>Ürün</th><th style="text-align:center">Adet</th><th style="text-align:right">Birim</th><th style="text-align:right">Toplam</th></tr></thead>
        <tbody>
          ${(order.order_items ?? []).map((i) => `
            <tr><td>${i.product_name}${i.variant_label ? ` — ${i.variant_label}` : ""}</td>
            <td style="text-align:center">${i.quantity}</td>
            <td style="text-align:right">${fmt(i.unit_price)}</td>
            <td style="text-align:right">${fmt(i.total_price ?? i.unit_price * i.quantity)}</td></tr>
          `).join("")}
        </tbody>
      </table>
      <div style="max-width:300px;margin-left:auto">
        <div class="row"><span>Ara Toplam</span><span>${fmt(order.subtotal ?? 0)}</span></div>
        ${order.discount_amount ? `<div class="row"><span>İndirim${order.coupon_code ? ` (${order.coupon_code})` : ""}</span><span>-${fmt(order.discount_amount)}</span></div>` : ""}
        <div class="row"><span>Kargo</span><span>${order.shipping_cost === 0 ? "Ücretsiz" : fmt(order.shipping_cost)}</span></div>
        <div class="row total"><span>Toplam</span><span>${fmt(order.total)}</span></div>
      </div>
      ${order.tracking_number ? `<p style="margin-top:20px;color:#888;font-size:12px">Kargo Takip: ${order.shipping_company ?? ""} — ${order.tracking_number}</p>` : ""}
      <script>window.onload=()=>window.print()</script>
      </body></html>
    `);
    w.document.close();
  }

  const fmt = (n: number) => `₺${(n ?? 0).toLocaleString("tr-TR")}`;

  if (loading) return <div className="p-6 space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  if (!order) return <div className="p-6 text-stone-500">Sipariş bulunamadı.</div>;

  const StatusIcon = STATUS_ICONS[order.status] ?? Package;
  const currentIdx = STATUS_FLOW.indexOf(order.status as typeof STATUS_FLOW[number]);

  return (
    <>
      <div className="min-h-screen bg-stone-50 p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="rounded-xl p-2 hover:bg-white border border-stone-200">
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-stone-800">{order.order_number}</h1>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status] ?? "bg-stone-100 text-stone-500"}`}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
              <p className="text-sm text-stone-500">{new Date(order.created_at).toLocaleDateString("tr-TR", { day:"2-digit",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit" })}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={printInvoice} className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50">
              <Printer size={14} /> Yazdır
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sol kolon */}
          <div className="lg:col-span-2 space-y-5">
            {/* Durum timeline */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="mb-4 font-semibold text-stone-700">Sipariş Durumu</h2>
              {order.status !== "cancelled" ? (
                <div className="flex items-center gap-0">
                  {STATUS_FLOW.map((s, i) => {
                    const done = i <= currentIdx;
                    const active = i === currentIdx;
                    const Icon = STATUS_ICONS[s] ?? Package;
                    return (
                      <div key={s} className="flex flex-1 flex-col items-center">
                        <div className="flex w-full items-center">
                          <div className={`flex-1 h-1 ${i === 0 ? "bg-transparent" : done ? "bg-stone-800" : "bg-stone-200"}`} />
                          <button
                            onClick={() => i > currentIdx && updateStatus(s)}
                            disabled={i <= currentIdx || saving}
                            title={i > currentIdx ? `${STATUS_LABELS[s]} yap` : undefined}
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition ${
                              active ? "border-stone-800 bg-stone-800 text-white"
                              : done ? "border-stone-800 bg-white text-stone-800"
                              : "border-stone-200 bg-white text-stone-300 hover:border-stone-400 hover:text-stone-600 cursor-pointer disabled:cursor-default"
                            }`}>
                            <Icon size={14 as any} />
                          </button>
                          <div className={`flex-1 h-1 ${i === STATUS_FLOW.length - 1 ? "bg-transparent" : i < currentIdx ? "bg-stone-800" : "bg-stone-200"}`} />
                        </div>
                        <span className={`mt-1.5 text-center text-xs font-medium ${active ? "text-stone-800" : done ? "text-stone-500" : "text-stone-300"}`}>
                          {STATUS_LABELS[s]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-red-600">
                  <XCircle size={16} />
                  <span className="text-sm font-medium">Bu sipariş iptal edildi.</span>
                </div>
              )}

              {/* Aksiyon butonları */}
              <div className="mt-4 flex flex-wrap gap-2">
                {order.status !== "cancelled" && order.status !== "delivered" && (
                  <button onClick={() => updateStatus("cancelled")} disabled={saving}
                    className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                    <XCircle size={14} /> İptal Et
                  </button>
                )}
                {order.status === "cancelled" && (
                  <button onClick={() => updateStatus("pending")} disabled={saving}
                    className="flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50">
                    <RotateCcw size={14} /> Geri Al
                  </button>
                )}
              </div>
            </div>

            {/* Ürünler */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="mb-4 font-semibold text-stone-700">Ürünler ({order.order_items?.length ?? 0})</h2>
              <div className="divide-y divide-stone-100">
                {(order.order_items ?? []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-lg">🌰</div>
                      <div>
                        <p className="font-medium text-stone-700">{item.product_name}</p>
                        {item.variant_label && <p className="text-xs text-stone-400">{item.variant_label}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-stone-800">{fmt(item.total_price ?? item.unit_price * item.quantity)}</p>
                      <p className="text-xs text-stone-400">{item.quantity} × {fmt(item.unit_price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fiyat özeti */}
              <div className="mt-4 rounded-xl bg-stone-50 p-4 space-y-2">
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Ara Toplam</span><span>{fmt(order.subtotal ?? 0)}</span>
                </div>
                {order.discount_amount ? (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>İndirim {order.coupon_code && `(${order.coupon_code})`}</span>
                    <span>−{fmt(order.discount_amount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Kargo</span>
                  <span>{order.shipping_cost === 0 ? "Ücretsiz" : fmt(order.shipping_cost)}</span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-2 font-bold text-stone-800">
                  <span>Toplam</span><span>{fmt(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Kargo etiketi & takip */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="mb-4 font-semibold text-stone-700">Kargo</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-stone-500">Takip Numarası</label>
                  <div className="mt-1 flex gap-2">
                    <input value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="YK12345678" className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400" />
                    {order.tracking_number && (
                      <a href={`https://gonderitakip.yurticikargo.com/tracking/TrackByQueryNumber?q=${order.tracking_number}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50">
                        <Truck size={14} /> Takip Et
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500">Notlar</label>
                  <textarea value={noteInput} onChange={(e) => setNoteInput(e.target.value)} rows={2}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none resize-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveTracking}
                    className="flex items-center gap-1.5 rounded-xl bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">
                    <Save size={14} /> Kaydet
                  </button>
                  {!order.tracking_number && order.status === "confirmed" && (
                    <button onClick={createYurticiLabel} disabled={creatingLabel}
                      className="flex items-center gap-1.5 rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-50">
                      <Truck size={14} /> {creatingLabel ? "Oluşturuluyor…" : "Yurtiçi Etiketi Oluştur"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sağ kolon */}
          <div className="space-y-5">
            {/* Müşteri */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="mb-4 font-semibold text-stone-700">Müşteri</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-stone-700">
                  <User size={14} className="text-stone-400" />{order.full_name}
                </div>
                <div className="flex items-center gap-2 text-stone-600">
                  <Mail size={14} className="text-stone-400" />
                  <a href={`mailto:${order.email}`} className="hover:text-stone-800">{order.email}</a>
                </div>
                {order.phone && (
                  <div className="flex items-center gap-2 text-stone-600">
                    <Phone size={14} className="text-stone-400" />
                    <a href={`tel:${order.phone}`} className="hover:text-stone-800">{order.phone}</a>
                  </div>
                )}
              </div>
            </div>

            {/* Teslimat Adresi */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="mb-4 font-semibold text-stone-700">Teslimat Adresi</h2>
              <div className="flex items-start gap-2 text-sm text-stone-600">
                <MapPin size={14} className="mt-0.5 shrink-0 text-stone-400" />
                <div>
                  <p>{order.address}</p>
                  <p>{[order.district, order.city].filter(Boolean).join(", ")}</p>
                  {order.postal_code && <p>{order.postal_code}</p>}
                </div>
              </div>
            </div>

            {/* Ödeme */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="mb-3 font-semibold text-stone-700">Ödeme</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Yöntem</span>
                  <span className="font-medium text-stone-700">{order.payment_method ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Durum</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    order.payment_status === "paid" ? "bg-green-100 text-green-700"
                    : order.payment_status === "pending" ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                  }`}>
                    {order.payment_status === "paid" ? "Ödendi" : order.payment_status === "pending" ? "Bekliyor" : order.payment_status}
                  </span>
                </div>
                {order.coupon_code && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Kupon</span>
                    <span className="font-mono text-xs text-stone-700">{order.coupon_code}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Durum geçmişi */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="mb-4 font-semibold text-stone-700">Geçmiş</h2>
              <div className="space-y-3">
                {(order.order_status_history ?? [])
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((h) => (
                    <div key={h.id} className="flex items-start gap-3">
                      <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
                      <div>
                        <p className="text-sm font-medium text-stone-700">{STATUS_LABELS[h.new_status] ?? h.new_status}</p>
                        <p className="text-xs text-stone-400">
                          {new Date(h.created_at).toLocaleDateString("tr-TR", { day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit" })}
                          {h.changed_by && ` · ${h.changed_by}`}
                        </p>
                        {h.note && <p className="mt-0.5 text-xs text-stone-500">{h.note}</p>}
                      </div>
                    </div>
                  ))}
                {!order.order_status_history?.length && (
                  <p className="text-xs text-stone-400">Henüz geçmiş yok.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
