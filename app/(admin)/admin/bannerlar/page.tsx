"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Banner { id:string; title:string; description:string|null; image_url:string|null; button_text:string|null; link_url:string|null; placement:string; sort_order:number; is_active:boolean; click_count:number; impression_count:number; starts_at:string|null; ends_at:string|null; }
const EMPTY = { title:"", description:"", image_url:"", button_text:"", button_url:"", position:"hero", sort_order:0, is_active:true, starts_at:"", ends_at:"" };

export default function AdminBannerlar() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(EMPTY);
  const [editId, setEditId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("banners").select("*").order("sort_order");
    setBanners((data as Banner[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing.title) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { ...editing, description:editing.description||null, image_url:editing.image_url||null, button_text:editing.button_text||null, link_url:editing.button_url||null, starts_at:editing.starts_at||null, ends_at:editing.ends_at||null, created_by:user?.id };
    if (editId) await supabase.from("banners").update(payload).eq("id", editId);
    else await supabase.from("banners").insert(payload);
    setSaving(false); setOpen(false); load();
  }

  async function remove(id:string) {
    if (!confirm("Banner silinsin mi?")) return;
    await supabase.from("banners").delete().eq("id", id);
    load();
  }

  async function toggle(id:string, val:boolean) {
    await supabase.from("banners").update({ is_active:val }).eq("id", id);
    setBanners(prev => prev.map(b => b.id===id?{...b,is_active:val}:b));
  }

  const POSITIONS: Record<string,string> = { hero:"Hero", sidebar:"Yan Panel", popup:"Pop-up", top:"Üst Bant" };

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">Bannerlar</div><div className="adm-page-sub">{banners.length} banner · {banners.filter(b=>b.is_active).length} aktif</div></div>
        <button className="adm-btn adm-btn--primary" onClick={() => { setEditing(EMPTY); setEditId(null); setOpen(true); }}>+ Yeni Banner</button>
      </div>
      <div className="adm-card">
        {loading ? <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div> : (
          <table className="adm-table">
            <thead><tr><th>Görsel</th><th>Başlık</th><th>Konum</th><th>Görüntülenme</th><th>Tıklanma</th><th>Sıra</th><th>Durum</th><th /></tr></thead>
            <tbody>
              {banners.map(b => (
                <tr key={b.id}>
                  <td>
                    {b.image_url
                      ? <img src={b.image_url} alt={b.title} style={{ width:48, height:30, objectFit:"cover", borderRadius:4, background:"var(--adm-surface-3)" }} />
                      : <div style={{ width:48, height:30, borderRadius:4, background:"var(--adm-surface-3)" }} />
                    }
                  </td>
                  <td className="adm-td--strong">{b.title}</td>
                  <td><span className="adm-badge adm-badge--muted">{POSITIONS[b.placement]||b.placement}</span></td>
                  <td className="adm-mono adm-text-muted">{b.impression_count.toLocaleString()}</td>
                  <td className="adm-mono adm-text-muted">{b.click_count.toLocaleString()}</td>
                  <td className="adm-mono">{b.sort_order}</td>
                  <td><div className={`adm-toggle${b.is_active?" on":""}`} onClick={() => toggle(b.id,!b.is_active)} /></td>
                  <td>
                    <div style={{ display:"flex", gap:4, justifyContent:"flex-end" }}>
                      <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => { setEditing({ title:b.title, description:b.description||"", image_url:b.image_url||"", button_text:b.button_text||"", button_url:b.link_url||"", position:b.placement, sort_order:b.sort_order, is_active:b.is_active, starts_at:b.starts_at?.slice(0,10)||"", ends_at:b.ends_at?.slice(0,10)||"" }); setEditId(b.id); setOpen(true); }}>Düzenle</button>
                      <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => remove(b.id)}>Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
              {banners.length===0 && <tr><td colSpan={8}><div className="adm-empty"><div className="adm-empty__title">Banner yok</div></div></td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="adm-overlay" onClick={() => setOpen(false)}>
          <div className="adm-modal adm-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">{editId?"Banner Düzenle":"Yeni Banner"}</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">Başlık</label><input className="adm-input" value={editing.title} onChange={e => setEditing({...editing,title:e.target.value})} /></div>
                <div className="adm-field"><label className="adm-label-text">Konum</label>
                  <select className="adm-select" value={editing.position} onChange={e => setEditing({...editing,position:e.target.value})}>
                    {Object.entries(POSITIONS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="adm-field"><label className="adm-label-text">Açıklama</label><textarea className="adm-textarea" rows={2} value={editing.description} onChange={e => setEditing({...editing,description:e.target.value})} /></div>
              <div className="adm-field"><label className="adm-label-text">Görsel URL</label><input className="adm-input" value={editing.image_url} onChange={e => setEditing({...editing,image_url:e.target.value})} /></div>
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">Buton Metni</label><input className="adm-input" value={editing.button_text} onChange={e => setEditing({...editing,button_text:e.target.value})} /></div>
                <div className="adm-field"><label className="adm-label-text">Buton URL</label><input className="adm-input" value={editing.button_url} onChange={e => setEditing({...editing,button_url:e.target.value})} /></div>
              </div>
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">Başlangıç</label><input className="adm-input" type="date" value={editing.starts_at} onChange={e => setEditing({...editing,starts_at:e.target.value})} /></div>
                <div className="adm-field"><label className="adm-label-text">Bitiş</label><input className="adm-input" type="date" value={editing.ends_at} onChange={e => setEditing({...editing,ends_at:e.target.value})} /></div>
                <div className="adm-field"><label className="adm-label-text">Sıra</label><input className="adm-input" type="number" value={editing.sort_order} onChange={e => setEditing({...editing,sort_order:Number(e.target.value)})} /></div>
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
