"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Package, AlertTriangle, CheckCircle, XCircle,
  ArrowUpCircle, ArrowDownCircle, Edit2, History, X,
} from "lucide-react";

interface InventoryRow {
  id: string;
  product_id: string;
  quantity: number;
  reserved_quantity: number;
  critical_level: number;
  warehouse_id: string | null;
  products: {
    id: string; name: string; slug: string;
    sku: string | null; main_image_url: string | null; price: number;
  } | null;
  warehouses: { name: string } | null;
  variants: { name: string } | null;
}

interface Movement {
  id: string; movement_type: string; quantity: number;
  notes: string | null; created_at: string;
  performed_by: string | null;
}

const MOVEMENT_LABELS: Record<string, string> = {
  purchase: "Satın Alma", sale: "Satış", adjustment: "Düzeltme",
  return: "İade", transfer: "Transfer", waste: "Fire",
};

export default function AdminEnvanter() {
  const supabase = createClient();
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "critical" | "ok" | "zero">("all");

  // Stok düzeltme modal
  const [adjustModal, setAdjustModal] = useState<InventoryRow | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustNote, setAdjustNote] = useState("");
  const [adjustType, setAdjustType] = useState("adjustment");
  const [saving, setSaving] = useState(false);

  // Hareket geçmişi modal
  const [historyModal, setHistoryModal] = useState<InventoryRow | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("inventory")
      .select(`
        id, product_id, quantity, reserved_quantity, critical_level, warehouse_id,
        products!product_id(id, name, slug, sku, main_image_url, price),
        warehouses!warehouse_id(name)
      `)
      .order("quantity", { ascending: true });

    if (error) console.error("Envanter yükleme hatası:", error);
    setRows((data ?? []) as unknown as InventoryRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function loadHistory(row: InventoryRow) {
    setHistoryModal(row);
    setHistoryLoading(true);
    const { data } = await supabase
      .from("inventory_movements")
      .select("id, movement_type, quantity, notes, created_at, performed_by")
      .eq("product_id", row.product_id)
      .order("created_at", { ascending: false })
      .limit(20);
    setMovements((data ?? []) as Movement[]);
    setHistoryLoading(false);
  }

  async function adjust() {
    if (!adjustModal) return;
    setSaving(true);
    const diff = adjustQty - adjustModal.quantity;
    const { data: { user } } = await supabase.auth.getUser();

    const [updateRes, insertRes] = await Promise.all([
      supabase.from("inventory").update({
        quantity: adjustQty,
        critical_level: adjustModal.critical_level,
      }).eq("id", adjustModal.id),
      supabase.from("inventory_movements").insert({
        product_id: adjustModal.product_id,
        warehouse_id: adjustModal.warehouse_id,
        movement_type: adjustType,
        quantity: diff,
        notes: adjustNote || null,
        performed_by: user?.id,
      }),
    ]);

    if (updateRes.error) console.error(updateRes.error);
    else {
      setAdjustModal(null);
      setAdjustQty(0);
      setAdjustNote("");
      load();
    }
    setSaving(false);
  }

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const nameMatch = !q ||
      (r.products?.name ?? "").toLowerCase().includes(q) ||
      (r.products?.sku ?? "").toLowerCase().includes(q);

    const filterMatch =
      filter === "all" ? true :
      filter === "zero" ? r.quantity === 0 :
      filter === "critical" ? r.quantity > 0 && r.quantity <= r.critical_level :
      filter === "ok" ? r.quantity > r.critical_level : true;

    return nameMatch && filterMatch;
  });

  const criticalCount = rows.filter((r) => r.quantity > 0 && r.quantity <= r.critical_level).length;
  const zeroCount = rows.filter((r) => r.quantity === 0).length;
  const okCount = rows.filter((r) => r.quantity > r.critical_level).length;

  function stockBadge(r: InventoryRow) {
    if (r.quantity === 0)
      return <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"><XCircle size={11} /> Tükendi</span>;
    if (r.quantity <= r.critical_level)
      return <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700"><AlertTriangle size={11} /> Kritik</span>;
    return <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"><CheckCircle size={11} /> Normal</span>;
  }

  function movementIcon(type: string, qty: number) {
    if (qty > 0) return <ArrowUpCircle size={14} className="text-green-500" />;
    return <ArrowDownCircle size={14} className="text-red-400" />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Envanter</h1>
          <p className="text-sm text-stone-500">{rows.length} ürün kaydı</p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Toplam", value: rows.length, color: "text-stone-800", bg: "bg-stone-50", f: "all" as const },
          { label: "Normal", value: okCount, color: "text-green-700", bg: "bg-green-50", f: "ok" as const },
          { label: "Kritik", value: criticalCount, color: "text-orange-700", bg: "bg-orange-50", f: "critical" as const },
          { label: "Tükendi", value: zeroCount, color: "text-red-700", bg: "bg-red-50", f: "zero" as const },
        ].map((k) => (
          <button key={k.f} onClick={() => setFilter(k.f)}
            className={`rounded-2xl border p-4 text-left transition ${filter === k.f ? "border-stone-800 ring-1 ring-stone-800" : "border-stone-200 hover:border-stone-300"} ${k.bg}`}>
            <p className="text-xs font-medium text-stone-500">{k.label}</p>
            <p className={`mt-1 text-2xl font-bold ${k.color}`}>{k.value}</p>
          </button>
        ))}
      </div>

      {/* Arama */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Package size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün adı veya SKU…"
            className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-stone-400" />
        </div>
      </div>

      {/* Tablo */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-stone-400 text-sm">Yükleniyor…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-sm">Kayıt bulunamadı</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 text-xs font-medium text-stone-500">
                <th className="px-4 py-3 text-left">Ürün</th>
                <th className="px-4 py-3 text-left">Depo</th>
                <th className="px-4 py-3 text-center">Stok</th>
                <th className="px-4 py-3 text-center">Rezerve</th>
                <th className="px-4 py-3 text-center">Kullanılabilir</th>
                <th className="px-4 py-3 text-center">Kritik Eşik</th>
                <th className="px-4 py-3 text-center">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((r) => {
                const avail = r.quantity - (r.reserved_quantity ?? 0);
                const pct = r.critical_level > 0 ? Math.min(100, (r.quantity / (r.critical_level * 3)) * 100) : 100;
                return (
                  <tr key={r.id} className="hover:bg-stone-50 transition-colors">
                    {/* Ürün */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {r.products?.main_image_url ? (
                          <img src={r.products.main_image_url} alt={r.products.name}
                            className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-stone-100 text-lg">🌰</div>
                        )}
                        <div>
                          <Link href={`/admin/urunler`}
                            className="font-medium text-stone-800 hover:text-stone-600 transition-colors">
                            {r.products?.name ?? "—"}
                          </Link>
                          {r.products?.sku && (
                            <p className="font-mono text-xs text-stone-400">{r.products.sku}</p>
                          )}
                          {r.products?.slug && (
                            <Link href={`/urun/${r.products.slug}`} target="_blank"
                              className="text-xs text-stone-400 hover:text-stone-600">
                              /urun/{r.products.slug} ↗
                            </Link>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Depo */}
                    <td className="px-4 py-3 text-stone-500">
                      {r.warehouses?.name ?? <span className="text-stone-300">—</span>}
                    </td>

                    {/* Stok */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`font-bold text-base tabular-nums ${
                          r.quantity === 0 ? "text-red-600"
                          : r.quantity <= r.critical_level ? "text-orange-600"
                          : "text-stone-800"
                        }`}>{r.quantity}</span>
                        {/* Stok progress bar */}
                        <div className="h-1 w-16 rounded-full bg-stone-200">
                          <div className={`h-full rounded-full transition-all ${
                            r.quantity === 0 ? "bg-red-500"
                            : r.quantity <= r.critical_level ? "bg-orange-400"
                            : "bg-green-500"
                          }`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>

                    {/* Rezerve */}
                    <td className="px-4 py-3 text-center font-mono text-stone-500">
                      {r.reserved_quantity ?? 0}
                    </td>

                    {/* Kullanılabilir */}
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold tabular-nums ${avail <= 0 ? "text-red-600" : "text-green-700"}`}>
                        {avail}
                      </span>
                    </td>

                    {/* Kritik Eşik */}
                    <td className="px-4 py-3 text-center font-mono text-stone-400">
                      {r.critical_level}
                    </td>

                    {/* Durum */}
                    <td className="px-4 py-3 text-center">{stockBadge(r)}</td>

                    {/* Aksiyonlar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => loadHistory(r)} title="Hareket geçmişi"
                          className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition">
                          <History size={15} />
                        </button>
                        <button onClick={() => { setAdjustModal(r); setAdjustQty(r.quantity); setAdjustNote(""); setAdjustType("adjustment"); }}
                          title="Stok düzenle"
                          className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition">
                          <Edit2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Stok Düzeltme Modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="font-semibold text-stone-800">Stok Düzeltme</h2>
                <p className="text-xs text-stone-500">{adjustModal.products?.name}</p>
              </div>
              <button onClick={() => setAdjustModal(null)} className="rounded-lg p-1.5 hover:bg-stone-100">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4 p-5">
              {/* Mevcut stok */}
              <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3">
                <span className="text-sm text-stone-500">Mevcut Stok</span>
                <span className="text-xl font-bold text-stone-800">{adjustModal.quantity} adet</span>
              </div>

              {/* İşlem tipi */}
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">İşlem Tipi</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "adjustment", label: "Düzeltme" },
                    { value: "purchase", label: "Satın Alma" },
                    { value: "return", label: "İade" },
                    { value: "waste", label: "Fire" },
                    { value: "transfer", label: "Transfer" },
                    { value: "sale", label: "Satış" },
                  ].map((t) => (
                    <button key={t.value} onClick={() => setAdjustType(t.value)}
                      className={`rounded-lg border py-2 text-xs font-medium transition ${
                        adjustType === t.value
                          ? "border-stone-800 bg-stone-800 text-white"
                          : "border-stone-200 text-stone-600 hover:border-stone-400"
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Yeni miktar */}
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">Yeni Miktar</label>
                <input type="number" min={0} value={adjustQty}
                  onChange={(e) => setAdjustQty(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-center text-lg font-bold outline-none focus:border-stone-400" />
              </div>

              {/* Değişim önizleme */}
              {adjustQty !== adjustModal.quantity && (
                <div className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${
                  adjustQty > adjustModal.quantity ? "bg-green-50" : "bg-red-50"
                }`}>
                  <span className="text-sm text-stone-500">Değişim</span>
                  <span className={`font-bold ${adjustQty > adjustModal.quantity ? "text-green-700" : "text-red-600"}`}>
                    {adjustQty > adjustModal.quantity ? "+" : ""}{adjustQty - adjustModal.quantity} adet
                  </span>
                </div>
              )}

              {/* Kritik eşik */}
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">Kritik Eşik</label>
                <input type="number" min={0} value={adjustModal.critical_level}
                  onChange={(e) => setAdjustModal((prev) => prev ? { ...prev, critical_level: Number(e.target.value) } : null)}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400" />
              </div>

              {/* Not */}
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">Not</label>
                <input value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="Neden değiştirildi?" maxLength={200}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400" />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t px-5 py-4">
              <button onClick={() => setAdjustModal(null)}
                className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50">
                İptal
              </button>
              <button onClick={adjust} disabled={saving}
                className="rounded-xl bg-stone-800 px-5 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50">
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hareket Geçmişi Modal */}
      {historyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="font-semibold text-stone-800">Hareket Geçmişi</h2>
                <p className="text-xs text-stone-500">{historyModal.products?.name}</p>
              </div>
              <button onClick={() => setHistoryModal(null)} className="rounded-lg p-1.5 hover:bg-stone-100">
                <X size={16} />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto p-5">
              {historyLoading ? (
                <div className="py-8 text-center text-sm text-stone-400">Yükleniyor…</div>
              ) : movements.length === 0 ? (
                <div className="py-8 text-center text-sm text-stone-400">Henüz hareket yok</div>
              ) : (
                <div className="space-y-3">
                  {movements.map((m) => (
                    <div key={m.id} className="flex items-start gap-3 rounded-xl border border-stone-100 p-3">
                      <div className="mt-0.5">{movementIcon(m.movement_type, m.quantity)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-stone-700">
                            {MOVEMENT_LABELS[m.movement_type] ?? m.movement_type}
                          </span>
                          <span className={`font-bold tabular-nums text-sm ${m.quantity > 0 ? "text-green-600" : "text-red-500"}`}>
                            {m.quantity > 0 ? "+" : ""}{m.quantity}
                          </span>
                        </div>
                        {m.notes && <p className="mt-0.5 text-xs text-stone-500 truncate">{m.notes}</p>}
                        <p className="mt-0.5 text-xs text-stone-400">
                          {new Date(m.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
