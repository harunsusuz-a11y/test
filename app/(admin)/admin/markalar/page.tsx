"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Brand { id: string; name: string; slug: string; description: string | null; logo_url: string | null; website: string | null; is_active: boolean; seo_title: string | null; seo_desc: string | null; }
const EMPTY: Omit<Brand,"id"> = { name:"", slug:"", description:"", logo_url:"", website:"", is_active:true, seo_title:"", seo_desc:"" };

export default function AdminMarkalar() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(EMPTY);
  const [editId, setEditId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("brands").select("*").is("deleted_at",null).order("name");
    setBrands((data as Brand[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function slugify(s: string) {
    return s.toLowerCase().replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s")
      .replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c")
      .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  }

  async function save() {
    if (!editing.name) return;
    setSaving(true);
    const payload = { ...editing, slug: editing.slug || slugify(editing.name), description: editing.description||null, logo_url: editing.logo_url||null, website: editing.website||null, seo_title: editing.seo_title||null, seo_desc: editing.seo_desc||null };
    if (editId) await supabase.from("brands").update(payload).eq("id", editId);
    else await supabase.from("brands").insert(payload);
    setSaving(false); setOpen(false); load();
  }

  async function remove(id: string) {
    if (!confirm("Marka silinsin mi?")) return;
    await supabase.from("brands").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    load();
  }

  const filtered = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">Markalar</div><div className="adm-page-sub">{brands.length} marka</div></div>
        <button className="adm-btn adm-btn--primary" onClick={() => { setEditing(EMPTY); setEditId(null); setOpen(true); }}>+ Yeni Marka</button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div className="adm-search" style={{ maxWidth: 300 }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/></svg>
          <input className="adm-input" placeholder="Marka ara…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="adm-card">
        {loading ? <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div> : (
          <table className="adm-table">
            <thead><tr><th>Logo</th><th>Ad</th><th>Slug</th><th>Web Site</th><th>Durum</th><th /></tr></thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td>
                    {b.logo_url
                      ? <img src={b.logo_url} alt={b.name} style={{ width: 32, height: 32, objectFit: "contain", borderRadius: 4, background: "var(--adm-surface-3)" }} />
                      : <div style={{ width: 32, height: 32, borderRadius: 4, background: "var(--adm-surface-3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--adm-text-4)" }}>{b.name[0]}</div>
                    }
                  </td>
                  <td className="adm-td--strong">{b.name}</td>
                  <td className="adm-mono adm-text-muted">{b.slug}</td>
                  <td>{b.website ? <a href={b.website} target="_blank" style={{ color: "var(--adm-accent)", fontSize: 11 }}>{b.website}</a> : "—"}</td>
                  <td><span className={`adm-badge ${b.is_active ? "adm-badge--green" : "adm-badge--muted"}`}>{b.is_active ? "Aktif" : "Pasif"}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => { setEditing({ ...b }); setEditId(b.id); setOpen(true); }}>Düzenle</button>
                      <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => remove(b.id)}>Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6}><div className="adm-empty"><div className="adm-empty__title">Marka bulunamadı</div></div></td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="adm-overlay" onClick={() => setOpen(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">{editId ? "Marka Düzenle" : "Yeni Marka"}</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">Ad</label><input className="adm-input" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value, slug: slugify(e.target.value) })} /></div>
                <div className="adm-field"><label className="adm-label-text">Slug</label><input className="adm-input" value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} /></div>
              </div>
              <div className="adm-field"><label className="adm-label-text">Açıklama</label><textarea className="adm-textarea" rows={2} value={editing.description||""} onChange={e => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">Logo URL</label><input className="adm-input" value={editing.logo_url||""} onChange={e => setEditing({ ...editing, logo_url: e.target.value })} /></div>
                <div className="adm-field"><label className="adm-label-text">Web Sitesi</label><input className="adm-input" value={editing.website||""} onChange={e => setEditing({ ...editing, website: e.target.value })} /></div>
              </div>
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">SEO Başlık</label><input className="adm-input" value={editing.seo_title||""} onChange={e => setEditing({ ...editing, seo_title: e.target.value })} /></div>
                <div className="adm-field"><label className="adm-label-text">SEO Açıklama</label><input className="adm-input" value={editing.seo_desc||""} onChange={e => setEditing({ ...editing, seo_desc: e.target.value })} /></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className={`adm-toggle${editing.is_active ? " on" : ""}`} onClick={() => setEditing({ ...editing, is_active: !editing.is_active })} />
                <span style={{ fontSize: 12, color: "var(--adm-text-2)" }}>Aktif</span>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn--secondary" onClick={() => setOpen(false)}>İptal</button>
              <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>{saving ? "Kaydediliyor…" : "Kaydet"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
