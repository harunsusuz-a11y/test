"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface InventoryRow {
  id: string; quantity: number; reserved_quantity: number; critical_level: number;
  product: { name: string; sku: string | null } | null;
  warehouse: { name: string } | null;
  variant: { name: string } | null;
}

export default function AdminEnvanter() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [adjustModal, setAdjustModal] = useState<{ id: string; current: number } | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustNote, setAdjustNote] = useState("");
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("inventory")
      .select("*, product:product_id(name, sku), warehouse:warehouse_id(name), variant:variant_id(name)")
      .order("created_at", { ascending: false });
    setRows((data as InventoryRow[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function adjust() {
    if (!adjustModal) return;
    const { data: { user } } = await supabase.auth.getUser();
    const inv = rows.find(r => r.id === adjustModal.id);
    if (!inv) return;
    const diff = adjustQty - adjustModal.current;
    await supabase.from("inventory").update({ quantity: adjustQty }).eq("id", adjustModal.id);
    await supabase.from("inventory_movements").insert({
      product_id: (inv as any).product_id,
      warehouse_id: (inv as any).warehouse_id,
      movement_type: "adjustment",
      quantity: diff,
      notes: adjustNote,
      performed_by: user?.id,
    });
    setAdjustModal(null);
    setAdjustQty(0);
    setAdjustNote("");
    load();
  }

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    return !q || r.product?.name.toLowerCase().includes(q) || (r.product?.sku || "").toLowerCase().includes(q);
  });

  const criticalCount = rows.filter(r => r.quantity <= r.critical_level).length;
  const outOfStock = rows.filter(r => r.quantity === 0).length;

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">Envanter</div><div className="adm-page-sub">{rows.length} kayıt</div></div>
      </div>

      <div className="adm-kpi-grid" style={{ marginBottom: 20 }}>
        {[
          { label: "Toplam Ürün", value: rows.length, color: "var(--adm-text)" },
          { label: "Kritik Stok", value: criticalCount, color: "var(--adm-yellow)" },
          { label: "Stok Tükendi", value: outOfStock, color: "var(--adm-red)" },
          { label: "Yeterli Stok", value: rows.length - criticalCount, color: "var(--adm-green)" },
        ].map((k, i) => (
          <div key={i} className="adm-stat">
            <div className="adm-stat__label">{k.label}</div>
            <div className="adm-stat__value" style={{ fontSize: 22, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="adm-search" style={{ maxWidth: 340 }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/></svg>
          <input className="adm-input" placeholder="Ürün adı veya SKU…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="adm-card">
        {loading ? <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div> : (
          <table className="adm-table">
            <thead>
              <tr><th>Ürün</th><th>Varyant</th><th>Depo</th><th>Stok</th><th>Rezerve</th><th>Kullanılabilir</th><th>Kritik</th><th /></tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const avail = r.quantity - r.reserved_quantity;
                const isCritical = r.quantity <= r.critical_level;
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="adm-td--strong">{r.product?.name || "—"}</div>
                      {r.product?.sku && <div style={{ fontSize: 10, color: "var(--adm-text-4)", fontFamily: "var(--adm-mono)" }}>{r.product.sku}</div>}
                    </td>
                    <td className="adm-text-muted">{r.variant?.name || "—"}</td>
                    <td className="adm-text-muted">{r.warehouse?.name || "—"}</td>
                    <td>
                      <span className="adm-mono adm-font-500" style={{ color: r.quantity === 0 ? "var(--adm-red)" : isCritical ? "var(--adm-yellow)" : "var(--adm-text)" }}>
                        {r.quantity}
                      </span>
                    </td>
                    <td className="adm-mono adm-text-muted">{r.reserved_quantity}</td>
                    <td className="adm-mono" style={{ color: avail <= 0 ? "var(--adm-red)" : "var(--adm-green)" }}>{avail}</td>
                    <td>
                      {isCritical
                        ? <span className="adm-badge adm-badge--yellow">Kritik</span>
                        : <span className="adm-badge adm-badge--green">Normal</span>}
                    </td>
                    <td>
                      <button className="adm-btn adm-btn--ghost adm-btn--sm"
                        onClick={() => { setAdjustModal({ id: r.id, current: r.quantity }); setAdjustQty(r.quantity); }}>
                        Düzenle
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={8}><div className="adm-empty"><div className="adm-empty__title">Kayıt bulunamadı</div></div></td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {adjustModal && (
        <div className="adm-overlay" onClick={() => setAdjustModal(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">Stok Düzeltme</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setAdjustModal(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field">
                <label className="adm-label-text">Mevcut Stok</label>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--adm-accent)", fontFamily: "var(--adm-mono)" }}>{adjustModal.current}</div>
              </div>
              <div className="adm-field">
                <label className="adm-label-text">Yeni Miktar</label>
                <input className="adm-input" type="number" value={adjustQty} onChange={e => setAdjustQty(Number(e.target.value))} min={0} />
              </div>
              <div className="adm-field">
                <label className="adm-label-text">Not</label>
                <input className="adm-input" value={adjustNote} onChange={e => setAdjustNote(e.target.value)} placeholder="Düzeltme nedeni…" />
              </div>
              {adjustQty !== adjustModal.current && (
                <div style={{ background: adjustQty > adjustModal.current ? "var(--adm-green-dim)" : "var(--adm-red-dim)", borderRadius: 7, padding: "10px 12px", fontSize: 12 }}>
                  <span style={{ color: adjustQty > adjustModal.current ? "var(--adm-green)" : "var(--adm-red)", fontWeight: 600 }}>
                    {adjustQty > adjustModal.current ? "+" : ""}{adjustQty - adjustModal.current} adet
                  </span>
                  <span style={{ color: "var(--adm-text-3)", marginLeft: 8 }}>değişim</span>
                </div>
              )}
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn--secondary" onClick={() => setAdjustModal(null)}>İptal</button>
              <button className="adm-btn adm-btn--primary" onClick={adjust}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
