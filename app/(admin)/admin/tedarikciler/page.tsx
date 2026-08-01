"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Supplier {
  id: string; name: string; email: string | null; phone: string | null;
  address: string | null; tax_number: string | null; website: string | null;
  is_active: boolean; notes: string | null; created_at: string;
}
const EMPTY = { name:"", email:"", phone:"", address:"", tax_number:"", website:"", is_active:true, notes:"" };

export default function AdminTedarikciler() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(EMPTY);
  const [editId, setEditId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("suppliers").select("*").is("deleted_at", null).order("name");
    setSuppliers((data as Supplier[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing.name) return;
    setSaving(true);
    const payload = { ...editing, email:editing.email||null, phone:editing.phone||null, address:editing.address||null, tax_number:editing.tax_number||null, website:editing.website||null, notes:editing.notes||null };
    if (editId) await supabase.from("suppliers").update(payload).eq("id", editId);
    else await supabase.from("suppliers").insert(payload);
    setSaving(false); setOpen(false); load();
  }

  async function remove(id: string) {
    if (!confirm("Tedarikçi silinsin mi?")) return;
    await supabase.from("suppliers").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    load();
  }

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">Tedarikçiler</div><div className="adm-page-sub">{suppliers.length} tedarikçi</div></div>
        <button className="adm-btn adm-btn--primary" onClick={() => { setEditing(EMPTY); setEditId(null); setOpen(true); }}>+ Yeni Tedarikçi</button>
      </div>
      <div className="adm-card">
        {loading ? <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div> : (
          <table className="adm-table">
            <thead><tr><th>Ad</th><th>E-posta</th><th>Telefon</th><th>Vergi No</th><th>Durum</th><th /></tr></thead>
            <tbody>
              {suppliers.map(s => (
                <tr key={s.id}>
                  <td className="adm-td--strong">{s.name}</td>
                  <td className="adm-text-muted">{s.email || "—"}</td>
                  <td className="adm-text-muted">{s.phone || "—"}</td>
                  <td className="adm-mono adm-text-muted">{s.tax_number || "—"}</td>
                  <td><span className={`adm-badge ${s.is_active?"adm-badge--green":"adm-badge--muted"}`}>{s.is_active?"Aktif":"Pasif"}</span></td>
                  <td>
                    <div style={{ display:"flex", gap:4, justifyContent:"flex-end" }}>
                      <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => { setEditing({ name:s.name, email:s.email||"", phone:s.phone||"", address:s.address||"", tax_number:s.tax_number||"", website:s.website||"", is_active:s.is_active, notes:s.notes||"" }); setEditId(s.id); setOpen(true); }}>Düzenle</button>
                      <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => remove(s.id)}>Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
              {suppliers.length===0 && <tr><td colSpan={6}><div className="adm-empty"><div className="adm-empty__title">Tedarikçi bulunamadı</div></div></td></tr>}
            </tbody>
          </table>
        )}
      </div>
      {open && (
        <div className="adm-overlay" onClick={() => setOpen(false)}>
          <div className="adm-modal adm-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">{editId?"Tedarikçi Düzenle":"Yeni Tedarikçi"}</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">Firma Adı</label><input className="adm-input" value={editing.name} onChange={e => setEditing({...editing,name:e.target.value})} /></div>
                <div className="adm-field"><label className="adm-label-text">Vergi No</label><input className="adm-input" value={editing.tax_number} onChange={e => setEditing({...editing,tax_number:e.target.value})} /></div>
              </div>
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">E-posta</label><input className="adm-input" type="email" value={editing.email} onChange={e => setEditing({...editing,email:e.target.value})} /></div>
                <div className="adm-field"><label className="adm-label-text">Telefon</label><input className="adm-input" value={editing.phone} onChange={e => setEditing({...editing,phone:e.target.value})} /></div>
              </div>
              <div className="adm-field"><label className="adm-label-text">Adres</label><textarea className="adm-textarea" rows={2} value={editing.address} onChange={e => setEditing({...editing,address:e.target.value})} /></div>
              <div className="adm-field"><label className="adm-label-text">Web Sitesi</label><input className="adm-input" value={editing.website} onChange={e => setEditing({...editing,website:e.target.value})} /></div>
              <div className="adm-field"><label className="adm-label-text">Notlar</label><textarea className="adm-textarea" rows={2} value={editing.notes} onChange={e => setEditing({...editing,notes:e.target.value})} /></div>
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
