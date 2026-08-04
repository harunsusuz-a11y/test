"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface PO {
  id: string; status: string; total_amount: number; expected_at: string | null;
  notes: string | null; created_at: string;
  supplier?: { name: string } | null;
  warehouse?: { name: string } | null;
}
interface Supplier { id: string; name: string; }
interface Warehouse { id: string; name: string; }

const STATUS_MAP: Record<string,string> = { draft:"adm-badge--muted", ordered:"adm-badge--blue", partial:"adm-badge--yellow", completed:"adm-badge--green", cancelled:"adm-badge--red" };
const STATUS_TR: Record<string,string> = { draft:"Taslak", ordered:"Sipariş Verildi", partial:"Kısmi", completed:"Tamamlandı", cancelled:"İptal" };

export default function AdminSatinAlma() {
  const [orders, setOrders] = useState<PO[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ supplier_id:"", notes:"", expected_at:"" });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data:o },{ data:s },{ data:w }] = await Promise.all([
      supabase.from("purchase_orders").select("*, suppliers(name)").order("created_at",{ascending:false}),
      supabase.from("suppliers").select("id,name").is("deleted_at",null).eq("is_active",true).order("name"),
      supabase.from("warehouses").select("id,name").eq("is_active",true).order("name"),
    ]);
    setOrders((o as PO[])||[]);
    setSuppliers((s as Supplier[])||[]);
    setWarehouses((w as Warehouse[])||[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function save() {

    setSaving(true);
    const { data:{user} } = await supabase.auth.getUser();
    await supabase.from("purchase_orders").insert({

      status: "draft", total_amount: 0,
      expected_at: form.expected_at || null, notes: form.notes || null,
      created_by: user?.id,
    });
    setSaving(false); setOpen(false); load();
  }

  async function updateStatus(id:string, status:string) {
    await supabase.from("purchase_orders").update({ status, updated_at:new Date().toISOString() }).eq("id",id);
    setOrders(prev => prev.map(o => o.id===id?{...o,status}:o));
  }

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">Satın Alma Siparişleri</div><div className="adm-page-sub">{orders.length} sipariş</div></div>
        <button className="adm-btn adm-btn--primary" onClick={() => { setForm({supplier_id:"",notes:"",expected_at:""}); setOpen(true); }}>+ Yeni Sipariş</button>
      </div>

      <div className="adm-kpi-grid" style={{ marginBottom:20 }}>
        {[
          { label:"Taslak",       value: orders.filter(o=>o.status==="draft").length,     color:"var(--adm-text-3)" },
          { label:"Sipariş Verildi",value:orders.filter(o=>o.status==="ordered").length,  color:"var(--adm-blue)" },
          { label:"Tamamlandı",   value: orders.filter(o=>o.status==="completed").length, color:"var(--adm-green)" },
          { label:"Toplam Tutar", value: `₺${orders.reduce((s,o)=>s+Number(o.total_amount),0).toLocaleString("tr-TR")}`, color:"var(--adm-accent)" },
        ].map((k,i) => (
          <div key={i} className="adm-stat">
            <div className="adm-stat__label">{k.label}</div>
            <div className="adm-stat__value" style={{ fontSize:20, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="adm-card">
        {loading ? <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div> : (
          <table className="adm-table">
            <thead><tr><th>Tedarikçi</th><th>Depo</th><th>Tutar</th><th>Beklenen</th><th>Durum</th><th /></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td className="adm-td--strong">{(o.supplier as any)?.name||"—"}</td>
                  <td className="adm-text-muted">{(o.warehouse as any)?.name||"—"}</td>
                  <td className="adm-mono">₺{Number(o.total_amount).toLocaleString("tr-TR")}</td>
                  <td style={{ fontSize:11, color:"var(--adm-text-4)" }}>{o.expected_at?new Date(o.expected_at).toLocaleDateString("tr-TR"):"—"}</td>
                  <td><span className={`adm-badge ${STATUS_MAP[o.status]||"adm-badge--muted"}`}>{STATUS_TR[o.status]||o.status}</span></td>
                  <td>
                    <div style={{ display:"flex", gap:4, justifyContent:"flex-end" }}>
                      {o.status==="draft" && <button className="adm-btn adm-btn--secondary adm-btn--sm" onClick={() => updateStatus(o.id,"ordered")}>Onayla</button>}
                      {o.status==="ordered" && <button className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => updateStatus(o.id,"completed")}>Tamamla</button>}
                      {!["completed","cancelled"].includes(o.status) && <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => updateStatus(o.id,"cancelled")}>İptal</button>}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length===0 && <tr><td colSpan={6}><div className="adm-empty"><div className="adm-empty__title">Satın alma siparişi yok</div></div></td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="adm-overlay" onClick={() => setOpen(false)}>
          <div className="adm-modal" onClick={e=>e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">Yeni Satın Alma Siparişi</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field"><label className="adm-label-text">Tedarikçi</label>
                <select className="adm-select" value={form.supplier_id} onChange={e=>setForm({...form,supplier_id:e.target.value})}>
                  <option value="">— Seç —</option>
                  {suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="adm-field"><label className="adm-label-text">Beklenen Tarih</label><input className="adm-input" type="date" value={form.expected_at} onChange={e=>setForm({...form,expected_at:e.target.value})} /></div>
              <div className="adm-field"><label className="adm-label-text">Notlar</label><textarea className="adm-textarea" rows={2} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn--secondary" onClick={() => setOpen(false)}>İptal</button>
              <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>{saving?"Kaydediliyor…":"Oluştur"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
