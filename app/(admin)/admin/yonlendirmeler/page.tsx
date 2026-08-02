"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Redirect { id:string; from_path:string; to_path:string; type:number; is_active:boolean; hit_count:number; created_at:string; }
const EMPTY = { from_path:"", to_path:"", type:301, is_active:true };

export default function AdminYonlendirmeler() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("redirects").select("*").order("created_at", { ascending: false });
    setRedirects((data as Redirect[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!form.from_path || !form.to_path) return;
    setSaving(true);
    await supabase.from("redirects").insert({ ...form });
    setSaving(false); setOpen(false); load();
  }

  async function remove(id: string) {
    if (!confirm("Yönlendirme silinsin mi?")) return;
    await supabase.from("redirects").delete().eq("id", id);
    load();
  }

  async function toggle(id: string, val: boolean) {
    await supabase.from("redirects").update({ is_active: val }).eq("id", id);
    setRedirects(prev => prev.map(r => r.id === id ? { ...r, is_active: val } : r));
  }

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">URL Yönlendirmeleri</div><div className="adm-page-sub">{redirects.length} yönlendirme</div></div>
        <button className="adm-btn adm-btn--primary" onClick={() => { setForm(EMPTY); setOpen(true); }}>+ Yeni Yönlendirme</button>
      </div>
      <div className="adm-card">
        {loading ? <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div> : (
          <table className="adm-table">
            <thead><tr><th>Kaynak URL</th><th>Hedef URL</th><th>Tip</th><th>Tıklanma</th><th>Durum</th><th /></tr></thead>
            <tbody>
              {redirects.map(r => (
                <tr key={r.id}>
                  <td className="adm-mono adm-text-accent">{r.from_path}</td>
                  <td className="adm-mono adm-text-muted">{r.to_path}</td>
                  <td><span className="adm-badge adm-badge--muted">{r.type}</span></td>
                  <td className="adm-mono">{r.hit_count.toLocaleString()}</td>
                  <td><div className={`adm-toggle${r.is_active?" on":""}`} onClick={() => toggle(r.id,!r.is_active)} /></td>
                  <td><button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => remove(r.id)}>Sil</button></td>
                </tr>
              ))}
              {redirects.length===0 && <tr><td colSpan={6}><div className="adm-empty"><div className="adm-empty__title">Yönlendirme yok</div></div></td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="adm-overlay" onClick={() => setOpen(false)}>
          <div className="adm-modal" onClick={e=>e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">Yeni URL Yönlendirmesi</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field"><label className="adm-label-text">Kaynak URL</label><input className="adm-input" style={{ fontFamily:"var(--adm-mono)" }} placeholder="/eski-sayfa" value={form.from_path} onChange={e=>setForm({...form,from_path:e.target.value})} /></div>
              <div className="adm-field"><label className="adm-label-text">Hedef URL</label><input className="adm-input" style={{ fontFamily:"var(--adm-mono)" }} placeholder="/yeni-sayfa" value={form.to_path} onChange={e=>setForm({...form,to_path:e.target.value})} /></div>
              <div className="adm-field"><label className="adm-label-text">Yönlendirme Tipi</label>
                <select className="adm-select" value={form.type} onChange={e=>setForm({...form,type:Number(e.target.value)})}>
                  <option value={301}>301 — Kalıcı</option>
                  <option value={302}>302 — Geçici</option>
                </select>
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
