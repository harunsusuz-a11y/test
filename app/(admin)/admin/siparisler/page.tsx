"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Order {
  id: string; order_number: string; status: string; payment_status: string;
  full_name: string; email: string; phone: string | null;
  address: string | null; city: string | null;
  subtotal: number; shipping_cost: number; discount: number; total: number;
  payment_method: string | null; tracking_number: string | null;
  customer_note: string | null; admin_note: string | null;
  shipping_company: string | null; coupon_code: string | null;
  created_at: string;
}

const STATUS_MAP: Record<string,string> = {
  pending:"adm-badge--yellow", confirmed:"adm-badge--blue",
  shipped:"adm-badge--blue", delivered:"adm-badge--green", cancelled:"adm-badge--red"
};
const STATUS_TR: Record<string,string> = {
  pending:"Bekliyor", confirmed:"Hazırlanıyor",
  shipped:"Kargoda", delivered:"Teslim", cancelled:"İptal"
};
const STATUS_FLOW: Record<string,string|null> = {
  pending:"confirmed", confirmed:"shipped", shipped:"delivered", delivered:null, cancelled:null
};
const ALL_STATUSES = ["pending","confirmed","shipped","delivered","cancelled"];

export default function AdminSiparisler() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order|null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [trackingNo, setTrackingNo] = useState("");
  const [page, setPage] = useState(0);
  const PER_PAGE = 20;
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("orders").select("*")
      .order("created_at", { ascending: false })
      .range(page * PER_PAGE, (page + 1) * PER_PAGE - 1);
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setOrders((data as Order[]) || []);
    setLoading(false);
  }, [supabase, filter, page]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const upd: any = { status, updated_at: new Date().toISOString() };
    if (adminNote) upd.admin_note = adminNote;
    if (trackingNo) upd.tracking_number = trackingNo;
    await supabase.from("orders").update(upd).eq("id", id);
    await supabase.from("order_status_history").insert({
      order_id: id, status, note: adminNote || null, created_by: user?.id
    }).select().maybeSingle();
    setSelected(null); setAdminNote(""); setTrackingNo("");
    load();
  }

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return !q || o.order_number.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.full_name.toLowerCase().includes(q);
  });

  const counts: Record<string,number> = {};
  ALL_STATUSES.forEach(s => { counts[s] = orders.filter(o => o.status === s).length; });

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Siparişler</div>
          <div className="adm-page-sub">{orders.length} sipariş listeleniyor</div>
        </div>
        <button className="adm-btn adm-btn--secondary" onClick={load}>↻ Yenile</button>
      </div>

      {/* KPI */}
      <div className="adm-kpi-grid" style={{ marginBottom: 20 }}>
        {[
          { label: "Bekleyen",     value: counts["pending"] || 0,   color: "var(--adm-yellow)" },
          { label: "Hazırlanıyor", value: counts["confirmed"] || 0, color: "var(--adm-blue)" },
          { label: "Kargoda",      value: counts["shipped"] || 0,   color: "var(--adm-blue)" },
          { label: "Teslim",       value: counts["delivered"] || 0, color: "var(--adm-green)" },
        ].map((k, i) => (
          <div key={i} className="adm-stat">
            <div className="adm-stat__label">{k.label}</div>
            <div className="adm-stat__value" style={{ fontSize: 22, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div className="adm-tabs">
          <button className={`adm-tab${filter === "all" ? " active" : ""}`} onClick={() => setFilter("all")}>Tümü</button>
          {ALL_STATUSES.map(s => (
            <button key={s} className={`adm-tab${filter === s ? " active" : ""}`} onClick={() => setFilter(s)}>
              {STATUS_TR[s]} {counts[s] > 0 ? `(${counts[s]})` : ""}
            </button>
          ))}
        </div>
        <div className="adm-search" style={{ flex: 1, maxWidth: 300 }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/></svg>
          <input className="adm-input" placeholder="Sipariş no, müşteri, e-posta…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="adm-card">
        {loading ? <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div> : (
          <>
            <table className="adm-table">
              <thead><tr><th>Sipariş No</th><th>Müşteri</th><th>Şehir</th><th>Toplam</th><th>Ödeme</th><th>Durum</th><th>Tarih</th><th /></tr></thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} style={{ cursor: "pointer" }} onClick={() => { setSelected(o); setAdminNote(o.admin_note || ""); setTrackingNo(o.tracking_number || ""); }}>
                    <td className="adm-mono adm-font-500" style={{ color: "var(--adm-accent)" }}>{o.order_number}</td>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--adm-text)" }}>{o.full_name}</div>
                      <div style={{ fontSize: 10, color: "var(--adm-text-4)" }}>{o.email}</div>
                    </td>
                    <td className="adm-text-muted">{o.city || "—"}</td>
                    <td className="adm-mono adm-font-500">₺{Number(o.total).toFixed(2)}</td>
                    <td><span className={`adm-badge ${o.payment_status === "paid" ? "adm-badge--green" : "adm-badge--yellow"}`}>{o.payment_status}</span></td>
                    <td><span className={`adm-badge ${STATUS_MAP[o.status] || "adm-badge--muted"}`}>{STATUS_TR[o.status] || o.status}</span></td>
                    <td style={{ fontSize: 11, color: "var(--adm-text-4)" }}>{new Date(o.created_at).toLocaleDateString("tr-TR")}</td>
                    <td><button className="adm-btn adm-btn--ghost adm-btn--sm">Detay</button></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={8}><div className="adm-empty"><div className="adm-empty__title">Sipariş bulunamadı</div></div></td></tr>}
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", borderTop: "1px solid var(--adm-border)" }}>
              <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>← Önceki</button>
              <span style={{ fontSize: 12, color: "var(--adm-text-3)" }}>Sayfa {page + 1}</span>
              <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setPage(p => p + 1)} disabled={orders.length < PER_PAGE}>Sonraki →</button>
            </div>
          </>
        )}
      </div>

      {/* Drawer */}
      {selected && (
        <>
          <div className="adm-overlay" style={{ justifyContent: "flex-end", padding: 0, alignItems: "stretch" }} onClick={() => setSelected(null)} />
          <div className="adm-drawer">
            <div className="adm-drawer-header">
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--adm-accent)", fontFamily: "var(--adm-mono)" }}>{selected.order_number}</div>
                <div style={{ fontSize: 11, color: "var(--adm-text-3)", marginTop: 2 }}>{new Date(selected.created_at).toLocaleString("tr-TR")}</div>
              </div>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="adm-drawer-body">
              {/* Durum & İşlemler */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span className={`adm-badge ${STATUS_MAP[selected.status]}`} style={{ fontSize: 12, padding: "4px 12px" }}>{STATUS_TR[selected.status]}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {STATUS_FLOW[selected.status] && (
                    <button className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => updateStatus(selected.id, STATUS_FLOW[selected.status]!)}>
                      → {STATUS_TR[STATUS_FLOW[selected.status]!]}
                    </button>
                  )}
                  {!["cancelled","delivered"].includes(selected.status) && (
                    <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => updateStatus(selected.id, "cancelled")}>İptal</button>
                  )}
                </div>
              </div>

              {/* Müşteri Bilgileri */}
              <div className="adm-card" style={{ marginBottom: 12 }}>
                <div className="adm-card-header"><span className="adm-card-title">Müşteri</span></div>
                <div className="adm-card-body">
                  {[
                    ["Ad Soyad", selected.full_name],
                    ["E-posta", selected.email],
                    ["Telefon", selected.phone || "—"],
                    ["Adres", selected.address || "—"],
                    ["Şehir", selected.city || "—"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: "var(--adm-text-4)", width: 70, flexShrink: 0 }}>{k}</span>
                      <span style={{ fontSize: 12, color: "var(--adm-text-2)" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tutar */}
              <div className="adm-card" style={{ marginBottom: 12 }}>
                <div className="adm-card-header"><span className="adm-card-title">Tutar</span></div>
                <div className="adm-card-body">
                  {[
                    ["Ara Toplam", `₺${Number(selected.subtotal).toFixed(2)}`],
                    ["Kargo", `₺${Number(selected.shipping_cost).toFixed(2)}`],
                    ["İndirim", selected.discount > 0 ? `-₺${Number(selected.discount).toFixed(2)}` : "—"],
                    ["Ödeme", selected.payment_method || "—"],
                    ["Kupon", selected.coupon_code || "—"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "var(--adm-text-3)" }}>{k}</span>
                      <span style={{ fontSize: 12, color: "var(--adm-text-2)", fontFamily: "var(--adm-mono)" }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--adm-border-2)", paddingTop: 8, marginTop: 6, fontWeight: 700 }}>
                    <span style={{ fontSize: 13, color: "var(--adm-text)" }}>Toplam</span>
                    <span style={{ fontSize: 14, color: "var(--adm-accent)", fontFamily: "var(--adm-mono)" }}>₺{Number(selected.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Kargo & Not */}
              <div className="adm-field">
                <label className="adm-label-text">Kargo Takip Numarası</label>
                <input className="adm-input" value={trackingNo} onChange={e => setTrackingNo(e.target.value)} placeholder="MNG / Yurtiçi / Aras kargo no" />
              </div>
              <div className="adm-field">
                <label className="adm-label-text">Admin Notu</label>
                <textarea className="adm-textarea" rows={2} value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Dahili not…" />
              </div>
              {selected.customer_note && (
                <div style={{ background: "var(--adm-yellow-dim)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 7, padding: "9px 12px", fontSize: 12, color: "var(--adm-yellow)", marginTop: 4 }}>
                  <strong>Müşteri Notu:</strong> {selected.customer_note}
                </div>
              )}
            </div>
            <div className="adm-drawer-footer">
              {(trackingNo !== (selected.tracking_number || "") || adminNote !== (selected.admin_note || "")) && (
                <button className="adm-btn adm-btn--primary" onClick={() => updateStatus(selected.id, selected.status)}>Kaydet</button>
              )}
              <button className="adm-btn adm-btn--secondary" onClick={() => setSelected(null)}>Kapat</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
