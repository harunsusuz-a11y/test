"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Return {
  id: string; type: string; status: string; reason: string | null;
  customer_description: string | null; admin_note: string | null;
  cargo_code: string | null; created_at: string;
  order: { order_number: string; total: number } | null;
}

const STATUS_MAP: Record<string,string> = { pending:"adm-badge--yellow", approved:"adm-badge--blue", rejected:"adm-badge--red", completed:"adm-badge--green" };
const STATUS_TR: Record<string,string> = { pending:"Bekliyor", approved:"Onaylandı", rejected:"Reddedildi", completed:"Tamamlandı" };

export default function AdminIadeler() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Return|null>(null);
  const [filter, setFilter] = useState("all");
  const [adminNote, setAdminNote] = useState("");
  const [cargoCode, setCargoCode] = useState("");
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("return_requests")
      .select("*, order:order_id(order_number, total)")
      .order("created_at", { ascending: false });
    setReturns((data as Return[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    const upd: any = { status, updated_at: new Date().toISOString() };
    if (adminNote) upd.admin_note = adminNote;
    if (cargoCode) upd.cargo_code = cargoCode;
    await supabase.from("return_requests").update(upd).eq("id", id);
    setSelected(null); setAdminNote(""); setCargoCode("");
    load();
  }

  const filtered = returns.filter(r => filter === "all" || r.status === filter);

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">İadeler & Değişimler</div><div className="adm-page-sub">{returns.length} talep</div></div>
      </div>

      <div className="adm-kpi-grid" style={{ marginBottom:20 }}>
        {[
          { label:"Bekleyen", value: returns.filter(r=>r.status==="pending").length, color:"var(--adm-yellow)" },
          { label:"Onaylanan", value: returns.filter(r=>r.status==="approved").length, color:"var(--adm-blue)" },
          { label:"Tamamlanan", value: returns.filter(r=>r.status==="completed").length, color:"var(--adm-green)" },
          { label:"Reddedilen", value: returns.filter(r=>r.status==="rejected").length, color:"var(--adm-red)" },
        ].map((k,i) => (
          <div key={i} className="adm-stat">
            <div className="adm-stat__label">{k.label}</div>
            <div className="adm-stat__value" style={{ fontSize:22, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="adm-tabs" style={{ marginBottom:16 }}>
        {[["all","Tümü"],["pending","Bekleyen"],["approved","Onaylanan"],["completed","Tamamlanan"],["rejected","Reddedilen"]].map(([k,l]) => (
          <button key={k} className={`adm-tab${filter===k?" active":""}`} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>

      <div className="adm-card">
        {loading ? <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div> : (
          <table className="adm-table">
            <thead><tr><th>Sipariş</th><th>Tip</th><th>Neden</th><th>Tutar</th><th>Tarih</th><th>Durum</th><th /></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ cursor:"pointer" }} onClick={() => { setSelected(r); setAdminNote(r.admin_note||""); setCargoCode(r.cargo_code||""); }}>
                  <td className="adm-mono">{(r.order as any)?.order_number || "—"}</td>
                  <td><span className="adm-badge adm-badge--muted">{"İade / Değişim"}</span></td>
                  <td style={{ maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"var(--adm-text-3)", fontSize:12 }}>{r.reason || "—"}</td>
                  <td className="adm-mono adm-text-accent">₺{(r.order as any)?.total?.toFixed(2) || "—"}</td>
                  <td style={{ fontSize:11, color:"var(--adm-text-4)" }}>{new Date(r.created_at).toLocaleDateString("tr-TR")}</td>
                  <td><span className={`adm-badge ${STATUS_MAP[r.status]}`}>{STATUS_TR[r.status]}</span></td>
                  <td><button className="adm-btn adm-btn--ghost adm-btn--sm">Detay</button></td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={7}><div className="adm-empty"><div className="adm-empty__title">Talep bulunamadı</div></div></td></tr>}
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
                <div style={{ fontSize:15, fontWeight:600, color:"var(--adm-text)" }}>
                  {"İade / Değişim"} Talebi
                </div>
                <div style={{ fontSize:11, color:"var(--adm-text-3)", marginTop:2 }}>{new Date(selected.created_at).toLocaleString("tr-TR")}</div>
              </div>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="adm-drawer-body">
              <div style={{ marginBottom:16 }}>
                <span className={`adm-badge ${STATUS_MAP[selected.status]}`} style={{ fontSize:12, padding:"4px 12px" }}>{STATUS_TR[selected.status]}</span>
              </div>
              <div className="adm-card" style={{ marginBottom:12 }}>
                <div className="adm-card-header"><span className="adm-card-title">Detaylar</span></div>
                <div className="adm-card-body">
                  {[["Sipariş No",(r => (r as any)?.order_number)(selected.order)],["Neden",selected.reason||"—"],["Müşteri Notu",selected.customer_description||"—"]].map(([k,v]) => (
                    <div key={k} style={{ display:"flex", gap:8, marginBottom:8 }}>
                      <span style={{ fontSize:11, color:"var(--adm-text-4)", width:90, flexShrink:0 }}>{k}</span>
                      <span style={{ fontSize:12, color:"var(--adm-text-2)" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="adm-field"><label className="adm-label-text">Admin Notu</label><textarea className="adm-textarea" rows={2} value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="İç not…" /></div>
              <div className="adm-field"><label className="adm-label-text">Kargo Kodu</label><input className="adm-input" value={cargoCode} onChange={e => setCargoCode(e.target.value)} placeholder="Kargo takip numarası…" /></div>
              {selected.status === "pending" && (
                <div style={{ display:"flex", gap:8 }}>
                  <button className="adm-btn adm-btn--primary" style={{ flex:1 }} onClick={() => updateStatus(selected.id,"approved")}>Onayla</button>
                  <button className="adm-btn adm-btn--danger" style={{ flex:1 }} onClick={() => updateStatus(selected.id,"rejected")}>Reddet</button>
                </div>
              )}
              {selected.status === "approved" && (
                <button className="adm-btn adm-btn--primary adm-w-full" onClick={() => updateStatus(selected.id,"completed")}>Tamamlandı Olarak İşaretle</button>
              )}
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
