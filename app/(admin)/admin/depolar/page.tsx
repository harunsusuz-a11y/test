"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Warehouse { id:string; name:string; address:string|null; city:string|null; is_active:boolean; created_at:string; }
const EMPTY = { name:"", address:"", city:"", is_active:true };

export default function AdminDepolar() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(EMPTY);
  const [editId, setEditId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("warehouses").select("*").order("created_at");
    setWarehouses((data as Warehouse[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing.name) return;
    setSaving(true);
    const payload = { name:editing.name, address:editing.address||null, city:editing.city||null, is_active:editing.is_active };
    if (editId) await supabase.from("warehouses").update(payload).eq("id", editId);
    else await supabase.from("warehouses").insert(payload);
    setSaving(false); setOpen(false); load();
  }

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">Depolar</div><div className="adm-page-sub">{warehouses.length} depo</div></div>
        <button className="adm-btn adm-btn--primary" onClick={() => { setEditing(EMPTY); setEditId(null); setOpen(true); }}>+ Yeni Depo</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
        {warehouses.map(w => (
          <div key={w.id} className="adm-card adm-card--hover">
            <div className="adm-card-header">
              <span className="adm-card-title">{w.name}</span>
              <span className={`adm-badge ${w.is_active?"adm-badge--green":"adm-badge--muted"}`}>{w.is_active?"Aktif":"Pasif"}</span>
            </div>
            <div className="adm-card-body">
              <div style={{ fontSize:12, color:"var(--adm-text-3)", marginBottom:4 }}>{w.city||""}</div>
              <div style={{ fontSize:11, color:"var(--adm-text-4)", marginBottom:12 }}>{w.address||"Adres girilmemiş"}</div>
              <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => {
                setEditing({ name:w.name, address:w.address||"", city:w.city||"", is_active:w.is_active });
                setEditId(w.id); setOpen(true);
              }}>Düzenle</button>
            </div>
          </div>
        ))}
        {!loading && warehouses.length===0 && <div className="adm-card"><div className="adm-empty"><div className="adm-empty__title">Depo bulunamadı</div></div></div>}
        {loading && <div className="adm-card"><div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div></div>}
      </div>

      {open && (
        <div className="adm-overlay" onClick={() => setOpen(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">{editId?"Depo Düzenle":"Yeni Depo"}</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">Ad</label><input className="adm-input" value={editing.name} onChange={e => setEditing({...editing,name:e.target.value})} /></div>
                <div className="adm-field"><label className="adm-label-text">Şehir</label><input className="adm-input" value={editing.city} onChange={e => setEditing({...editing,city:e.target.value})} /></div>
              </div>
              <div className="adm-field"><label className="adm-label-text">Adres</label><textarea className="adm-textarea" rows={2} value={editing.address} onChange={e => setEditing({...editing,address:e.target.value})} /></div>
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
