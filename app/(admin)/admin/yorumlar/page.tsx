"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Review {
  id: string; product_slug: string | null; reviewer_name: string | null;
  rating: number; comment: string | null; status: string;
  admin_reply: string | null; is_verified_purchase: boolean | null;
  created_at: string;
  product?: { name: string } | null;
}

const STATUS_MAP: Record<string,string> = { pending:"adm-badge--yellow", approved:"adm-badge--green", rejected:"adm-badge--red", spam:"adm-badge--red" };
const STATUS_TR: Record<string,string> = { pending:"Bekliyor", approved:"Onaylı", rejected:"Reddedildi", spam:"Spam" };

export default function AdminYorumlar() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Review|null>(null);
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("reviews").select("*, product:product_id(name)").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setReviews((data as Review[]) || []);
    setLoading(false);
  }, [supabase, filter]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    await supabase.from("reviews").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
  }

  async function saveReply() {
    if (!selected) return;
    setSaving(true);
    await supabase.from("reviews").update({ admin_reply: reply, updated_at: new Date().toISOString() }).eq("id", selected.id);
    setReviews(prev => prev.map(r => r.id === selected.id ? { ...r, admin_reply: reply } : r));
    setSelected(prev => prev ? { ...prev, admin_reply: reply } : null);
    setSaving(false);
  }

  function Stars({ n }: { n: number }) {
    return <span style={{ color:"var(--adm-yellow)", fontSize:13 }}>{"★".repeat(n)}{"☆".repeat(5-n)}</span>;
  }

  const counts: Record<string,number> = { all: reviews.length, pending:0, approved:0, rejected:0, spam:0 };
  reviews.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Yorumlar</div>
          <div className="adm-page-sub">{reviews.length} yorum · {counts["pending"]} bekliyor</div>
        </div>
        <button className="adm-btn adm-btn--secondary" onClick={load}>↻ Yenile</button>
      </div>

      <div className="adm-kpi-grid" style={{ marginBottom:20 }}>
        {[
          { label:"Toplam",    value:counts["all"],      color:"var(--adm-text)" },
          { label:"Bekliyor",  value:counts["pending"],  color:"var(--adm-yellow)" },
          { label:"Onaylı",    value:counts["approved"], color:"var(--adm-green)" },
          { label:"Reddedildi",value:counts["rejected"], color:"var(--adm-red)" },
        ].map((k,i) => (
          <div key={i} className="adm-stat">
            <div className="adm-stat__label">{k.label}</div>
            <div className="adm-stat__value" style={{ fontSize:22, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="adm-tabs" style={{ marginBottom:16 }}>
        {[["all","Tümü"],["pending","Bekliyor"],["approved","Onaylı"],["rejected","Reddedildi"],["spam","Spam"]].map(([k,l]) => (
          <button key={k} className={`adm-tab${filter===k?" active":""}`} onClick={() => setFilter(k)}>
            {l} {counts[k]>0?`(${counts[k]})`:""}</button>
        ))}
      </div>

      <div className="adm-card">
        {loading ? <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div> : (
          <table className="adm-table">
            <thead><tr><th>Ürün</th><th>Kullanıcı</th><th>Puan</th><th>Yorum</th><th>Onaylı Alım</th><th>Tarih</th><th>Durum</th><th /></tr></thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r.id} style={{ cursor:"pointer" }} onClick={() => { setSelected(r); setReply(r.admin_reply||""); }}>
                  <td className="adm-td--strong" style={{ fontSize:11 }}>{(r.product as any)?.name || r.product_slug || "—"}</td>
                  <td className="adm-text-muted">{r.reviewer_name || "Anonim"}</td>
                  <td><Stars n={r.rating} /></td>
                  <td style={{ maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:11, color:"var(--adm-text-2)" }}>{r.comment || "—"}</td>
                  <td>{r.is_verified_purchase ? <span className="adm-badge adm-badge--green" style={{ fontSize:9 }}>Onaylı</span> : <span className="adm-badge adm-badge--muted" style={{ fontSize:9 }}>—</span>}</td>
                  <td style={{ fontSize:11, color:"var(--adm-text-4)" }}>{new Date(r.created_at).toLocaleDateString("tr-TR")}</td>
                  <td><span className={`adm-badge ${STATUS_MAP[r.status]||"adm-badge--muted"}`}>{STATUS_TR[r.status]||r.status}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display:"flex", gap:3 }}>
                      {r.status!=="approved" && <button className="adm-btn adm-btn--ghost adm-btn--sm" style={{ fontSize:10 }} onClick={() => updateStatus(r.id,"approved")}>Onayla</button>}
                      {r.status!=="rejected" && <button className="adm-btn adm-btn--danger adm-btn--sm" style={{ fontSize:10 }} onClick={() => updateStatus(r.id,"rejected")}>Reddet</button>}
                    </div>
                  </td>
                </tr>
              ))}
              {reviews.length===0 && <tr><td colSpan={8}><div className="adm-empty"><div className="adm-empty__title">Yorum bulunamadı</div></div></td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <>
          <div className="adm-overlay" style={{ justifyContent:"flex-end", padding:0, alignItems:"stretch" }} onClick={() => setSelected(null)} />
          <div className="adm-drawer">
            <div className="adm-drawer-header">
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:"var(--adm-text)" }}>{selected.reviewer_name || "Anonim"}</div>
                <Stars n={selected.rating} />
              </div>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="adm-drawer-body">
              <span className={`adm-badge ${STATUS_MAP[selected.status]||"adm-badge--muted"}`} style={{ fontSize:11, padding:"4px 12px", marginBottom:16, display:"inline-block" }}>
                {STATUS_TR[selected.status]||selected.status}
              </span>
              <div style={{ display:"flex", gap:6, marginBottom:16 }}>
                {selected.status!=="approved" && <button className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => updateStatus(selected.id,"approved")}>Onayla</button>}
                {selected.status!=="rejected" && <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => updateStatus(selected.id,"rejected")}>Reddet</button>}
                <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => updateStatus(selected.id,"spam")}>Spam İşaretle</button>
              </div>
              {selected.comment && (
                <div className="adm-card" style={{ marginBottom:12 }}>
                  <div className="adm-card-header"><span className="adm-card-title">Yorum</span></div>
                  <div className="adm-card-body">
                    <div style={{ fontSize:12, color:"var(--adm-text-2)", lineHeight:1.7 }}>{selected.comment}</div>
                  </div>
                </div>
              )}
              {selected.admin_reply && (
                <div style={{ background:"var(--adm-accent-dim)", border:"1px solid rgba(200,162,107,0.2)", borderRadius:7, padding:"10px 12px", marginBottom:12, fontSize:12, color:"var(--adm-accent)" }}>
                  <strong>Mevcut Yanıt:</strong> {selected.admin_reply}
                </div>
              )}
              <div className="adm-field">
                <label className="adm-label-text">Admin Yanıtı</label>
                <textarea className="adm-textarea" rows={4} value={reply} onChange={e => setReply(e.target.value)} placeholder="Müşteriye yanıt yaz…" />
              </div>
              <button className="adm-btn adm-btn--primary" onClick={saveReply} disabled={saving}>{saving?"Kaydediliyor…":"Yanıtı Kaydet"}</button>
            </div>
            <div className="adm-drawer-footer">
              <button className="adm-btn adm-btn--secondary" onClick={() => setSelected(null)}>Kapat</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
