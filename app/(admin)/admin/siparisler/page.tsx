"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface OrderItem { id:string; product_name:string; product_slug:string|null; quantity:number; unit_price:number; image:string|null; }
interface Order {
  id:string; order_number:string; status:string; payment_status:string;
  full_name:string; email:string; phone:string|null;
  address:string|null; city:string|null; postal_code:string|null;
  subtotal:number; shipping_cost:number; discount:number; total:number;
  currency:string; payment_method:string|null; tracking_number:string|null;
  shipping_company:string|null; coupon_code:string|null;
  customer_note:string|null; admin_note:string|null;
  created_at:string; updated_at:string;
  items?: OrderItem[];
}

const STATUS_COLORS: Record<string,string> = {
  pending:"#f59e0b", confirmed:"#60a5fa", shipped:"#818cf8", delivered:"#34d399", cancelled:"#f87171"
};
const STATUS_TR: Record<string,string> = {
  pending:"Bekliyor", confirmed:"Hazırlanıyor", shipped:"Kargoda", delivered:"Teslim Edildi", cancelled:"İptal"
};
const STATUS_FLOW: Record<string,string|null> = {
  pending:"confirmed", confirmed:"shipped", shipped:"delivered", delivered:null, cancelled:null
};

export default function AdminSiparisler() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order|null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [trackingNo, setTrackingNo] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const PER = 25;
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("orders").select("*", { count:"exact" })
      .order("created_at", { ascending:false })
      .range(page*PER, (page+1)*PER-1);
    if (filter!=="all") q = q.eq("status", filter);
    const { data, count } = await q;
    setOrders((data as Order[]) || []);
    setTotal(count || 0);
    setLoading(false);
  }, [supabase, filter, page]);

  useEffect(() => { load(); }, [load]);

  async function openOrder(o: Order) {
    setSelected(o);
    setAdminNote(o.admin_note||"");
    setTrackingNo(o.tracking_number||"");
    // Load order items
    const { data } = await supabase.from("order_items")
      .select("*").eq("order_id", o.id);
    setItems((data as OrderItem[]) || []);
  }

  async function updateStatus(id:string, status:string) {
    const { data:{ user } } = await supabase.auth.getUser();
    const upd: Record<string,unknown> = { status, updated_at:new Date().toISOString() };
    if (adminNote) upd.admin_note = adminNote;
    if (trackingNo) upd.tracking_number = trackingNo;
    await supabase.from("orders").update(upd).eq("id", id);
    try {
      await supabase.from("order_status_history").insert({
        order_id:id, new_status:status, note:adminNote||null, changed_by:user?.id
      });
    } catch {}
    setOrders(prev => prev.map(o => o.id===id ? { ...o, status, tracking_number:trackingNo||o.tracking_number, admin_note:adminNote||o.admin_note } : o));
    if (selected?.id===id) setSelected(prev => prev ? { ...prev, status } : null);
  }

  async function saveNotes() {
    if (!selected) return;
    await supabase.from("orders").update({ admin_note:adminNote, tracking_number:trackingNo, updated_at:new Date().toISOString() }).eq("id", selected.id);
    setOrders(prev => prev.map(o => o.id===selected.id ? { ...o, admin_note:adminNote, tracking_number:trackingNo } : o));
    setSelected(prev => prev ? { ...prev, admin_note:adminNote, tracking_number:trackingNo } : null);
  }

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return !q || o.order_number.toLowerCase().includes(q) || o.email.toLowerCase().includes(q) || o.full_name.toLowerCase().includes(q);
  });

  const counts: Record<string,number> = { pending:0, confirmed:0, shipped:0, delivered:0, cancelled:0 };
  orders.forEach(o => { if (counts[o.status]!==undefined) counts[o.status]++; });

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Siparişler</div>
          <div className="adm-page-sub">{total.toLocaleString("tr-TR")} sipariş</div>
        </div>
        <button className="adm-btn adm-btn--secondary" onClick={load}>↻ Yenile</button>
      </div>

      {/* KPI */}
      <div className="adm-kpi-grid" style={{ marginBottom:20 }}>
        {Object.entries(STATUS_TR).map(([k,l]) => (
          <div key={k} className="adm-stat" style={{ cursor:"pointer" }} onClick={() => { setFilter(k); setPage(0); }}>
            <div className="adm-stat__label">{l}</div>
            <div className="adm-stat__value" style={{ fontSize:22, color:STATUS_COLORS[k] }}>{counts[k]}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <div className="adm-tabs">
          <button className={`adm-tab${filter==="all"?" active":""}`} onClick={() => { setFilter("all"); setPage(0); }}>Tümü</button>
          {Object.entries(STATUS_TR).map(([k,l]) => (
            <button key={k} className={`adm-tab${filter===k?" active":""}`} onClick={() => { setFilter(k); setPage(0); }}>{l}</button>
          ))}
        </div>
        <div className="adm-search" style={{ flex:1, maxWidth:320 }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/></svg>
          <input className="adm-input" placeholder="Sipariş no, müşteri, e-posta…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="adm-card">
        {loading ? <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div> : (
          <>
            <table className="adm-table">
              <thead>
                <tr><th>Sipariş No</th><th>Müşteri</th><th>Şehir</th><th>Tutar</th><th>Ödeme</th><th>Durum</th><th>Tarih</th><th /></tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} style={{ cursor:"pointer" }} onClick={() => openOrder(o)}>
                    <td><span className="adm-mono adm-font-500" style={{ color:"var(--adm-accent)" }}>{o.order_number}</span></td>
                    <td>
                      <div style={{ fontWeight:500, color:"var(--adm-text)", fontSize:12 }}>{o.full_name}</div>
                      <div style={{ fontSize:10, color:"var(--adm-text-4)" }}>{o.email}</div>
                    </td>
                    <td className="adm-text-muted">{o.city||"—"}</td>
                    <td><span className="adm-mono adm-font-500">₺{Number(o.total).toFixed(2)}</span></td>
                    <td>
                      <span className={`adm-badge ${o.payment_status==="paid"?"adm-badge--green":"adm-badge--yellow"}`}>
                        {o.payment_status==="paid"?"Ödendi":"Bekliyor"}
                      </span>
                    </td>
                    <td>
                      <span className="adm-badge" style={{ background:`${STATUS_COLORS[o.status]}18`, color:STATUS_COLORS[o.status] }}>
                        {STATUS_TR[o.status]||o.status}
                      </span>
                    </td>
                    <td style={{ fontSize:11, color:"var(--adm-text-4)" }}>{new Date(o.created_at).toLocaleDateString("tr-TR")}</td>
                    <td><button className="adm-btn adm-btn--ghost adm-btn--sm">Detay</button></td>
                  </tr>
                ))}
                {filtered.length===0 && <tr><td colSpan={8}><div className="adm-empty"><div className="adm-empty__title">Sipariş bulunamadı</div></div></td></tr>}
              </tbody>
            </table>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderTop:"1px solid var(--adm-border)" }}>
              <button className="adm-btn adm-btn--ghost adm-btn--sm" disabled={page===0} onClick={() => setPage(p=>p-1)}>← Önceki</button>
              <span style={{ fontSize:11, color:"var(--adm-text-3)" }}>{page*PER+1}–{Math.min((page+1)*PER, total)} / {total}</span>
              <button className="adm-btn adm-btn--ghost adm-btn--sm" disabled={(page+1)*PER>=total} onClick={() => setPage(p=>p+1)}>Sonraki →</button>
            </div>
          </>
        )}
      </div>

      {/* Drawer */}
      {selected && (
        <>
          <div className="adm-overlay" style={{ justifyContent:"flex-end", padding:0, alignItems:"stretch" }} onClick={() => setSelected(null)} />
          <div className="adm-drawer" style={{ width:420 }}>
            <div className="adm-drawer-header">
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:"var(--adm-accent)", fontFamily:"var(--adm-mono)" }}>{selected.order_number}</div>
                <div style={{ fontSize:11, color:"var(--adm-text-3)", marginTop:2 }}>{new Date(selected.created_at).toLocaleString("tr-TR")}</div>
              </div>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="adm-drawer-body">
              {/* Durum + Aksiyon */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <span className="adm-badge" style={{ background:`${STATUS_COLORS[selected.status]}18`, color:STATUS_COLORS[selected.status], fontSize:12, padding:"4px 12px" }}>
                  {STATUS_TR[selected.status]}
                </span>
                <div style={{ display:"flex", gap:6 }}>
                  {STATUS_FLOW[selected.status] && (
                    <button className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => updateStatus(selected.id, STATUS_FLOW[selected.status]!)}>
                      → {STATUS_TR[STATUS_FLOW[selected.status]!]}
                    </button>
                  )}
                  {!["cancelled","delivered"].includes(selected.status) && (
                    <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => updateStatus(selected.id,"cancelled")}>İptal</button>
                  )}
                </div>
              </div>

              {/* Ürünler */}
              {items.length>0 && (
                <div className="adm-card" style={{ marginBottom:12 }}>
                  <div className="adm-card-header"><span className="adm-card-title">Ürünler ({items.length})</span></div>
                  {items.map((item,i) => (
                    <div key={item.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", borderBottom:i<items.length-1?"1px solid var(--adm-border)":"none" }}>
                      <div style={{ width:32, height:32, borderRadius:5, overflow:"hidden", background:"var(--adm-surface-3)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {item.image ? <img src={item.image} alt={item.product_name} style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : <span style={{ fontSize:14 }}>📦</span>}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:500, color:"var(--adm-text-2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.product_name}</div>
                        <div style={{ fontSize:10, color:"var(--adm-text-4)" }}>×{item.quantity} · ₺{Number(item.unit_price).toFixed(2)}</div>
                      </div>
                      <span style={{ fontFamily:"var(--adm-mono)", fontWeight:600, fontSize:13, color:"var(--adm-text)", flexShrink:0 }}>
                        ₺{(item.quantity * Number(item.unit_price)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Müşteri */}
              <div className="adm-card" style={{ marginBottom:12 }}>
                <div className="adm-card-header"><span className="adm-card-title">Müşteri & Teslimat</span></div>
                <div className="adm-card-body">
                  {[
                    ["Ad Soyad", selected.full_name],
                    ["E-posta", selected.email],
                    ["Telefon", selected.phone||"—"],
                    ["Adres", selected.address||"—"],
                    ["Şehir", `${selected.city||"—"}${selected.postal_code?` ${selected.postal_code}`:""}`],
                    ["Ödeme", selected.payment_method||"—"],
                    ["Kupon", selected.coupon_code||"—"],
                  ].map(([k,v]) => (
                    <div key={k} style={{ display:"flex", gap:8, marginBottom:6 }}>
                      <span style={{ fontSize:11, color:"var(--adm-text-4)", width:72, flexShrink:0 }}>{k}</span>
                      <span style={{ fontSize:12, color:"var(--adm-text-2)" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tutar Özeti */}
              <div className="adm-card" style={{ marginBottom:12 }}>
                <div className="adm-card-header"><span className="adm-card-title">Tutar</span></div>
                <div style={{ padding:"8px 14px" }}>
                  {[
                    ["Ara Toplam", `₺${Number(selected.subtotal).toFixed(2)}`],
                    ["Kargo", `₺${Number(selected.shipping_cost).toFixed(2)}`],
                    ["İndirim", selected.discount>0 ? `-₺${Number(selected.discount).toFixed(2)}` : "—"],
                  ].map(([k,v]) => (
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid var(--adm-border)" }}>
                      <span style={{ fontSize:12, color:"var(--adm-text-3)" }}>{k}</span>
                      <span style={{ fontSize:12, fontFamily:"var(--adm-mono)", color:"var(--adm-text-2)" }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0 2px", fontWeight:700 }}>
                    <span style={{ fontSize:13 }}>Toplam</span>
                    <span style={{ fontSize:15, fontFamily:"var(--adm-mono)", color:"var(--adm-accent)" }}>₺{Number(selected.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Kargo & Not */}
              <div className="adm-field">
                <label className="adm-label-text">Kargo Takip Numarası</label>
                <input className="adm-input" value={trackingNo} onChange={e => setTrackingNo(e.target.value)} placeholder="MNG / Yurtiçi takip no…" />
              </div>
              <div className="adm-field">
                <label className="adm-label-text">Admin Notu</label>
                <textarea className="adm-textarea" rows={2} value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Dahili not…" />
              </div>

              {selected.customer_note && (
                <div style={{ background:"var(--adm-yellow-dim)", border:"1px solid rgba(251,191,36,0.2)", borderRadius:7, padding:"9px 12px", fontSize:12, color:"var(--adm-yellow)" }}>
                  <strong>Müşteri Notu:</strong> {selected.customer_note}
                </div>
              )}
            </div>

            <div className="adm-drawer-footer">
              <button className="adm-btn adm-btn--primary" onClick={saveNotes}>Kaydet</button>
              <button className="adm-btn adm-btn--secondary" onClick={() => setSelected(null)}>Kapat</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
