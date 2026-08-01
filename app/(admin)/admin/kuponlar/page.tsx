"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Coupon { id:string; code:string; type:string; value:number; min_cart:number; max_discount:number|null; usage_limit:number|null; per_user_limit:number; used_count:number; is_active:boolean; starts_at:string|null; ends_at:string|null; }
const EMPTY = { code:"", type:"percent", value:10, min_cart:0, max_discount:"", usage_limit:"", per_user_limit:1, is_active:true, starts_at:"", ends_at:"" };

export default function AdminKuponlar() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(EMPTY);
  const [editId, setEditId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending:false });
    setCoupons((data as Coupon[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing.code) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      code: editing.code.toUpperCase(), type:editing.type, value:Number(editing.value),
      min_cart:Number(editing.min_cart), max_discount:editing.max_discount?Number(editing.max_discount):null,
      usage_limit:editing.usage_limit?Number(editing.usage_limit):null,
      per_user_limit:Number(editing.per_user_limit),
      is_active:editing.is_active, starts_at:editing.starts_at||null, ends_at:editing.ends_at||null,
      created_by:user?.id,
    };
    if (editId) await supabase.from("coupons").update(payload).eq("id", editId);
    else await supabase.from("coupons").insert(payload);
    setSaving(false); setOpen(false); load();
  }

  async function toggle(id:string, val:boolean) {
    await supabase.from("coupons").update({ is_active:val }).eq("id", id);
    setCoupons(prev => prev.map(c => c.id===id?{...c,is_active:val}:c));
  }

  async function remove(id:string) {
    if (!confirm("Kupon silinsin mi?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">Kuponlar</div><div className="adm-page-sub">{coupons.length} kupon · {coupons.filter(c=>c.is_active).length} aktif</div></div>
        <button className="adm-btn adm-btn--primary" onClick={() => { setEditing(EMPTY); setEditId(null); setOpen(true); }}>+ Yeni Kupon</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
        {[
          { label:"Toplam Kullanım", value:coupons.reduce((s,c)=>s+c.used_count,0) },
          { label:"Aktif Kupon", value:coupons.filter(c=>c.is_active).length },
          { label:"Limitsiz", value:coupons.filter(c=>!c.usage_limit).length },
        ].map((k,i) => (
          <div key={i} className="adm-stat"><div className="adm-stat__label">{k.label}</div><div className="adm-stat__value" style={{ fontSize:22 }}>{k.value}</div></div>
        ))}
      </div>

      <div className="adm-card">
        {loading ? <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div> : (
          <table className="adm-table">
            <thead><tr><th>Kod</th><th>İndirim</th><th>Min. Sepet</th><th>Kullanım</th><th>Son Tarih</th><th>Durum</th><th /></tr></thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id}>
                  <td>
                    <span style={{ fontFamily:"var(--adm-mono)", fontSize:13, fontWeight:700, color:"var(--adm-accent)", background:"var(--adm-accent-dim)", padding:"2px 8px", borderRadius:4, letterSpacing:"0.05em" }}>{c.code}</span>
                  </td>
                  <td className="adm-td--strong">{c.type==="percent"?`%${c.value}`:`₺${c.value}`}</td>
                  <td className="adm-text-muted">{c.min_cart>0?`₺${c.min_cart}`:"—"}</td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:12, color:"var(--adm-text-2)", minWidth:36 }}>{c.used_count}{c.usage_limit?`/${c.usage_limit}`:""}</span>
                      {c.usage_limit && (
                        <div className="adm-progress" style={{ flex:1, minWidth:60 }}>
                          <div className="adm-progress-bar" style={{ width:`${Math.min(100,(c.used_count/c.usage_limit)*100)}%` }} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="adm-text-muted">{c.ends_at?new Date(c.ends_at).toLocaleDateString("tr-TR"):"—"}</td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div className={`adm-toggle${c.is_active?" on":""}`} onClick={() => toggle(c.id,!c.is_active)} />
                      <span style={{ fontSize:11, color:"var(--adm-text-3)" }}>{c.is_active?"Aktif":"Pasif"}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display:"flex", gap:4, justifyContent:"flex-end" }}>
                      <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => { setEditing({ code:c.code, type:c.type, value:c.value, min_cart:c.min_cart, max_discount:c.max_discount?.toString()||"", usage_limit:c.usage_limit?.toString()||"", per_user_limit:c.per_user_limit, is_active:c.is_active, starts_at:c.starts_at?.slice(0,10)||"", ends_at:c.ends_at?.slice(0,10)||"" }); setEditId(c.id); setOpen(true); }}>Düzenle</button>
                      <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => remove(c.id)}>Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length===0 && <tr><td colSpan={7}><div className="adm-empty"><div className="adm-empty__title">Kupon yok</div></div></td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="adm-overlay" onClick={() => setOpen(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">{editId?"Kupon Düzenle":"Yeni Kupon"}</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field"><label className="adm-label-text">Kupon Kodu</label><input className="adm-input" style={{ fontFamily:"var(--adm-mono)", textTransform:"uppercase", fontWeight:600 }} value={editing.code} onChange={e => setEditing({...editing,code:e.target.value.toUpperCase()})} placeholder="VENTI10" /></div>
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">Tip</label>
                  <select className="adm-select" value={editing.type} onChange={e => setEditing({...editing,type:e.target.value})}>
                    <option value="percent">Yüzde (%)</option>
                    <option value="fixed">Sabit (₺)</option>
                    <option value="free_shipping">Ücretsiz Kargo</option>
                  </select>
                </div>
                <div className="adm-field"><label className="adm-label-text">Değer</label><input className="adm-input" type="number" value={editing.value} onChange={e => setEditing({...editing,value:Number(e.target.value)})} /></div>
              </div>
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">Min. Sepet (₺)</label><input className="adm-input" type="number" value={editing.min_cart} onChange={e => setEditing({...editing,min_cart:Number(e.target.value)})} /></div>
                <div className="adm-field"><label className="adm-label-text">Max. İndirim (₺)</label><input className="adm-input" type="number" value={editing.max_discount} onChange={e => setEditing({...editing,max_discount:e.target.value})} /></div>
              </div>
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">Toplam Limit</label><input className="adm-input" type="number" value={editing.usage_limit} onChange={e => setEditing({...editing,usage_limit:e.target.value})} /></div>
                <div className="adm-field"><label className="adm-label-text">Kullanıcı Başı</label><input className="adm-input" type="number" value={editing.per_user_limit} onChange={e => setEditing({...editing,per_user_limit:Number(e.target.value)})} /></div>
              </div>
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">Başlangıç</label><input className="adm-input" type="date" value={editing.starts_at} onChange={e => setEditing({...editing,starts_at:e.target.value})} /></div>
                <div className="adm-field"><label className="adm-label-text">Bitiş</label><input className="adm-input" type="date" value={editing.ends_at} onChange={e => setEditing({...editing,ends_at:e.target.value})} /></div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div className={`adm-toggle${editing.is_active?" on":""}`} onClick={() => setEditing({...editing,is_active:!editing.is_active})} />
                <span style={{ fontSize:12, color:"var(--adm-text-2)" }}>Aktif</span>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn--secondary" onClick={() => setOpen(false)}>İptal</button>
              <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>{saving?"Kaydediliyor…":"Kaydet"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
