"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Order {
  id:string; order_number:string; status:string; payment_status:string;
  total:number; shipping_cost:number; discount_amount:number;
  payment_method:string|null; tracking_number:string|null;
  customer_note:string|null; admin_note:string|null;
  created_at:string; updated_at:string;
  customer?:{ profile?:{ first_name:string; last_name:string; email:string; phone:string|null }|null }|null;
  items?:{ product_name:string; variant_name:string|null; quantity:number; price:number; total:number }[];
  addresses?:{ type:string; first_name:string; last_name:string; address_line:string; city:string; phone:string|null }[];
}

const STATUS_MAP: Record<string,string> = { pending:"adm-badge--yellow", payment_pending:"adm-badge--yellow", preparing:"adm-badge--blue", shipped:"adm-badge--blue", delivered:"adm-badge--green", cancelled:"adm-badge--red", refunded:"adm-badge--red", failed:"adm-badge--red" };
const STATUS_TR: Record<string,string> = { pending:"Bekliyor", payment_pending:"Ödeme Bekliyor", preparing:"Hazırlanıyor", shipped:"Kargoda", delivered:"Teslim", cancelled:"İptal", refunded:"İade", failed:"Başarısız" };
const STATUS_FLOW: Record<string,string|null> = { pending:"preparing", payment_pending:"preparing", preparing:"shipped", shipped:"delivered", delivered:null, cancelled:null, refunded:null, failed:null };

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
    let q = supabase.from("orders")
      .select("*, customer:customer_id(profile:id(first_name,last_name,email,phone)), items:order_items(product_name,variant_name,quantity,price,total), addresses:order_addresses(*)")
      .order("created_at",{ascending:false})
      .range(page*PER_PAGE,(page+1)*PER_PAGE-1);
    if (filter!=="all") q = q.eq("status",filter);
    const { data } = await q;
    setOrders((data as Order[]) || []);
    setLoading(false);
  }, [supabase, filter, page]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id:string, status:string) {
    const { data:{user} } = await supabase.auth.getUser();
    const upd: any = { status, updated_at:new Date().toISOString() };
    if (adminNote) upd.admin_note = adminNote;
    if (trackingNo) upd.tracking_number = trackingNo;
    await supabase.from("orders").update(upd).eq("id",id);
    await supabase.from("order_status_history").insert({ order_id:id, status, note:adminNote||null, created_by:user?.id });
    setSelected(null); setAdminNote(""); setTrackingNo("");
    load();
  }

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const p = (o.customer as any)?.profile;
    return !q || o.order_number.toLowerCase().includes(q) || (p?.email||"").toLowerCase().includes(q) || (`${p?.first_name||""} ${p?.last_name||""}`).toLowerCase().includes(q);
  });

  const counts = Object.keys(STATUS_TR).reduce((acc,k) => ({ ...acc, [k]:orders.filter(o=>o.status===k).length }), {} as Record<string,number>);

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">Siparişler</div><div className="adm-page-sub">{orders.length} sipariş</div></div>
        <button className="adm-btn adm-btn--secondary" onClick={load}>↻ Yenile</button>
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <div className="adm-tabs" style={{ flexWrap:"wrap" }}>
          <button className={`adm-tab${filter==="all"?" active":""}`} onClick={() => setFilter("all")}>Tümü ({orders.length})</button>
          {Object.entries(STATUS_TR).map(([k,l]) => (
            <button key={k} className={`adm-tab${filter===k?" active":""}`} onClick={() => setFilter(k)}>
              {l} {counts[k]>0?`(${counts[k]})`:""}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:12 }}>
        <div className="adm-search" style={{ maxWidth:340 }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/></svg>
          <input className="adm-input" placeholder="Sipariş no, müşteri ara…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="adm-card">
        {loading ? <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div> : (
          <>
            <table className="adm-table">
              <thead><tr><th>Sipariş No</th><th>Müşteri</th><th>Toplam</th><th>Ödeme</th><th>Durum</th><th>Tarih</th><th /></tr></thead>
              <tbody>
                {filtered.map(o => {
                  const p = (o.customer as any)?.profile;
                  return (
                    <tr key={o.id} style={{ cursor:"pointer" }} onClick={() => { setSelected(o); setAdminNote(o.admin_note||""); setTrackingNo(o.tracking_number||""); }}>
                      <td className="adm-mono adm-font-500" style={{ color:"var(--adm-accent)" }}>{o.order_number}</td>
                      <td>
                        <div style={{ fontSize:12, fontWeight:500, color:"var(--adm-text)" }}>{p?`${p.first_name} ${p.last_name}`:"—"}</div>
                        <div style={{ fontSize:10, color:"var(--adm-text-4)" }}>{p?.email||""}</div>
                      </td>
                      <td className="adm-mono adm-font-500">₺{Number(o.total).toFixed(2)}</td>
                      <td><span className={`adm-badge ${o.payment_status==="paid"?"adm-badge--green":"adm-badge--yellow"}`}>{o.payment_status}</span></td>
                      <td><span className={`adm-badge ${STATUS_MAP[o.status]||"adm-badge--muted"}`}>{STATUS_TR[o.status]||o.status}</span></td>
                      <td style={{ fontSize:11, color:"var(--adm-text-4)" }}>{new Date(o.created_at).toLocaleDateString("tr-TR")}</td>
                      <td><button className="adm-btn adm-btn--ghost adm-btn--sm">Detay</button></td>
                    </tr>
                  );
                })}
                {filtered.length===0 && <tr><td colSpan={7}><div className="adm-empty"><div className="adm-empty__title">Sipariş bulunamadı</div></div></td></tr>}
              </tbody>
            </table>
            <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 14px", borderTop:"1px solid var(--adm-border)" }}>
              <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setPage(p=>Math.max(0,p-1))} disabled={page===0}>← Önceki</button>
              <span style={{ fontSize:12, color:"var(--adm-text-3)" }}>Sayfa {page+1}</span>
              <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setPage(p=>p+1)} disabled={orders.length<PER_PAGE}>Sonraki →</button>
            </div>
          </>
        )}
      </div>

      {selected && (
        <>
          <div className="adm-overlay" style={{ justifyContent:"flex-end", padding:0, alignItems:"stretch" }} onClick={() => setSelected(null)} />
          <div className="adm-drawer">
            <div className="adm-drawer-header">
              <div>
                <div style={{ fontSize:15, fontWeight:600, color:"var(--adm-accent)", fontFamily:"var(--adm-mono)" }}>{selected.order_number}</div>
                <div style={{ fontSize:11, color:"var(--adm-text-3)", marginTop:2 }}>{new Date(selected.created_at).toLocaleString("tr-TR")}</div>
              </div>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="adm-drawer-body">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <span className={`adm-badge ${STATUS_MAP[selected.status]}`} style={{ fontSize:12, padding:"4px 12px" }}>{STATUS_TR[selected.status]}</span>
                <div style={{ display:"flex", gap:6 }}>
                  {STATUS_FLOW[selected.status] && (
                    <button className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => updateStatus(selected.id,STATUS_FLOW[selected.status]!)}>
                      → {STATUS_TR[STATUS_FLOW[selected.status]!]}
                    </button>
                  )}
                  {!["cancelled","delivered","refunded"].includes(selected.status) && (
                    <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => updateStatus(selected.id,"cancelled")}>İptal</button>
                  )}
                </div>
              </div>

              {/* Ürünler */}
              {selected.items && selected.items.length>0 && (
                <div className="adm-card" style={{ marginBottom:12 }}>
                  <div className="adm-card-header"><span className="adm-card-title">Ürünler</span></div>
                  {selected.items.map((item,i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 14px", borderBottom:i<selected.items!.length-1?"1px solid var(--adm-border)":"none" }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:500, color:"var(--adm-text-2)" }}>{item.product_name}</div>
                        {item.variant_name && <div style={{ fontSize:10, color:"var(--adm-text-4)" }}>{item.variant_name}</div>}
                        <div style={{ fontSize:10, color:"var(--adm-text-4)" }}>×{item.quantity}</div>
                      </div>
                      <span style={{ fontFamily:"var(--adm-mono)", fontWeight:600, color:"var(--adm-text)" }}>₺{Number(item.total).toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 14px", borderTop:"1px solid var(--adm-border-2)", fontWeight:700, fontFamily:"var(--adm-mono)" }}>
                    <span style={{ color:"var(--adm-text-2)" }}>Toplam</span>
                    <span style={{ color:"var(--adm-accent)" }}>₺{Number(selected.total).toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Kargo takip */}
              <div className="adm-field"><label className="adm-label-text">Kargo Takip Numarası</label><input className="adm-input" value={trackingNo} onChange={e => setTrackingNo(e.target.value)} placeholder="MNG / …" /></div>
              <div className="adm-field"><label className="adm-label-text">Admin Notu</label><textarea className="adm-textarea" rows={2} value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="İç not…" /></div>

              {selected.customer_note && (
                <div style={{ background:"var(--adm-yellow-dim)", border:"1px solid rgba(251,191,36,0.2)", borderRadius:7, padding:"9px 12px", fontSize:12, color:"var(--adm-yellow)" }}>
                  <strong>Müşteri Notu:</strong> {selected.customer_note}
                </div>
              )}
            </div>
            <div className="adm-drawer-footer">
              <button className="adm-btn adm-btn--secondary" onClick={() => { if(trackingNo||adminNote) updateStatus(selected.id,selected.status); else setSelected(null); }}>Kaydet & Kapat</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
