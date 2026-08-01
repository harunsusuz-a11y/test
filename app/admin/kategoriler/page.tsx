"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string; name: string; slug: string; description: string | null;
  parent_id: string | null; sort_order: number; is_active: boolean;
  is_featured: boolean; show_in_menu: boolean; image_url: string | null;
  seo_title: string | null; seo_desc: string | null;
  parent?: { name: string } | null;
}

const EMPTY: Omit<Category, "id" | "parent"> = {
  name: "", slug: "", description: "", parent_id: null,
  sort_order: 0, is_active: true, is_featured: false,
  show_in_menu: true, image_url: "", seo_title: "", seo_desc: "",
};

export default function AdminKategoriler() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Category> & typeof EMPTY>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("categories")
      .select("*, parent:parent_id(name)")
      .is("deleted_at", null)
      .order("sort_order");
    setCats((data as Category[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function openNew() { setEditing(EMPTY); setEditId(null); setOpen(true); }
  function openEdit(c: Category) {
    setEditing({ ...c });
    setEditId(c.id);
    setOpen(true);
  }

  function slugify(s: string) {
    return s.toLowerCase().replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s")
      .replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c")
      .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  }

  async function save() {
    if (!editing.name) return;
    setSaving(true);
    const payload = {
      name: editing.name, slug: editing.slug || slugify(editing.name),
      description: editing.description || null,
      parent_id: editing.parent_id || null,
      sort_order: editing.sort_order || 0,
      is_active: editing.is_active, is_featured: editing.is_featured,
      show_in_menu: editing.show_in_menu,
      image_url: editing.image_url || null,
      seo_title: editing.seo_title || null, seo_desc: editing.seo_desc || null,
    };
    if (editId) {
      await supabase.from("categories").update(payload).eq("id", editId);
    } else {
      await supabase.from("categories").insert(payload);
    }
    setSaving(false);
    setOpen(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Kategori silinsin mi?")) return;
    await supabase.from("categories").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    load();
  }

  async function toggle(id: string, val: boolean) {
    await supabase.from("categories").update({ is_active: val }).eq("id", id);
    setCats(prev => prev.map(c => c.id === id ? { ...c, is_active: val } : c));
  }

  const filtered = cats.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const rootCats = cats.filter(c => !c.parent_id);

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Kategoriler</div>
          <div className="adm-page-sub">{cats.length} kategori</div>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={openNew}>+ Yeni Kategori</button>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div className="adm-search" style={{ maxWidth: 300 }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/></svg>
          <input className="adm-input" placeholder="Kategori ara…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="adm-card">
        {loading ? (
          <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div>
        ) : filtered.length === 0 ? (
          <div className="adm-empty"><div className="adm-empty__title">Kategori bulunamadı</div></div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr><th>Ad</th><th>Slug</th><th>Üst Kategori</th><th>Sıra</th><th>Menü</th><th>Durum</th><th /></tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td className="adm-td--strong">
                    {!c.parent_id ? c.name : <span style={{ paddingLeft: 16, color: "var(--adm-text-2)" }}>↳ {c.name}</span>}
                  </td>
                  <td className="adm-mono adm-text-muted">{c.slug}</td>
                  <td className="adm-text-muted">{(c.parent as any)?.name || "—"}</td>
                  <td className="adm-text-muted">{c.sort_order}</td>
                  <td>
                    {c.show_in_menu
                      ? <span className="adm-badge adm-badge--green">Evet</span>
                      : <span className="adm-badge adm-badge--muted">Hayır</span>}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className={`adm-toggle${c.is_active ? " on" : ""}`} onClick={() => toggle(c.id, !c.is_active)} />
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => openEdit(c)}>Düzenle</button>
                      <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => remove(c.id)}>Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="adm-overlay" onClick={() => setOpen(false)}>
          <div className="adm-modal adm-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">{editId ? "Kategori Düzenle" : "Yeni Kategori"}</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field-row">
                <div className="adm-field">
                  <label className="adm-label-text">Ad</label>
                  <input className="adm-input" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value, slug: slugify(e.target.value) })} />
                </div>
                <div className="adm-field">
                  <label className="adm-label-text">Slug</label>
                  <input className="adm-input" value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} />
                </div>
              </div>
              <div className="adm-field-row">
                <div className="adm-field">
                  <label className="adm-label-text">Üst Kategori</label>
                  <select className="adm-select" value={editing.parent_id || ""} onChange={e => setEditing({ ...editing, parent_id: e.target.value || null })}>
                    <option value="">— Kök Kategori —</option>
                    {rootCats.filter(c => c.id !== editId).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="adm-field">
                  <label className="adm-label-text">Sıra</label>
                  <input className="adm-input" type="number" value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
                </div>
              </div>
              <div className="adm-field">
                <label className="adm-label-text">Açıklama</label>
                <textarea className="adm-textarea" rows={2} value={editing.description || ""} onChange={e => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="adm-field">
                <label className="adm-label-text">Görsel URL</label>
                <input className="adm-input" value={editing.image_url || ""} onChange={e => setEditing({ ...editing, image_url: e.target.value })} />
              </div>
              <div className="adm-field-row">
                <div className="adm-field">
                  <label className="adm-label-text">SEO Başlık</label>
                  <input className="adm-input" value={editing.seo_title || ""} onChange={e => setEditing({ ...editing, seo_title: e.target.value })} />
                </div>
                <div className="adm-field">
                  <label className="adm-label-text">SEO Açıklama</label>
                  <input className="adm-input" value={editing.seo_desc || ""} onChange={e => setEditing({ ...editing, seo_desc: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[
                  { key: "is_active", label: "Aktif" },
                  { key: "show_in_menu", label: "Menüde Göster" },
                  { key: "is_featured", label: "Öne Çıkar" },
                ].map(({ key, label }) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className={`adm-toggle${editing[key as keyof typeof editing] ? " on" : ""}`}
                      onClick={() => setEditing({ ...editing, [key]: !editing[key as keyof typeof editing] })} />
                    <span style={{ fontSize: 12, color: "var(--adm-text-2)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn--secondary" onClick={() => setOpen(false)}>İptal</button>
              <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
