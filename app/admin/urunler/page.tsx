"use client";
import React, { useState } from "react";
import { products as INITIAL, type Product } from "@/content/products";

type EP = Product;

const CATS: { key: "tümü" | "protein-bar" | "findik-kremasi"; label: string }[] = [
  { key: "tümü", label: "Tümü" },
  { key: "protein-bar", label: "Protein Bar" },
  { key: "findik-kremasi", label: "Fındık Kreması" },
];

export default function AdminUrunler() {
  const [items, setItems] = useState<EP[]>(INITIAL as EP[]);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<"tümü" | "protein-bar" | "findik-kremasi">("tümü");
  const [editing, setEditing] = useState<EP | null>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("list");

  const filtered = items.filter((p) => {
    const mc = cat === "tümü" || p.category === cat;
    const ms = p.name.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  function openNew() {
    setEditing({
      slug: "", name: "", category: "protein-bar", flavor: "",
      shortDescription: "", description: "",
      weightGrams: 45, price: 0, compareAtPrice: undefined,
      image: "/images/hero-bars.jpg", gallery: [],
      attributes: [], highlights: [], ingredients: [],
      nutritionPer100g: [], usageTips: [], faq: [],
      isDemo: true,
    });
    setOpen(true);
  }

  function openEdit(p: EP) { setEditing({ ...p }); setOpen(true); }

  function save() {
    if (!editing) return;
    setItems(prev => {
      const idx = prev.findIndex(p => p.slug === editing.slug);
      if (idx >= 0) { const n = [...prev]; n[idx] = editing; return n; }
      return [...prev, { ...editing, slug: editing.name.toLowerCase().replace(/\s+/g, "-") }];
    });
    setOpen(false);
  }

  function remove(slug: string) {
    if (!confirm("Ürün silinsin mi?")) return;
    setItems(prev => prev.filter(p => p.slug !== slug));
  }

  return (
    <div>
      {/* Header */}
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Ürünler</div>
          <div className="adm-page-sub">{items.length} ürün · {filtered.length} listeleniyor</div>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={openNew}>+ Yeni Ürün</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div className="adm-tabs">
          {CATS.map(c => (
            <button key={c.key} className={`adm-tab${cat === c.key ? " active" : ""}`} onClick={() => setCat(c.key)}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="adm-search" style={{ flex: 1, maxWidth: 300 }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/></svg>
          <input
            className="adm-input"
            placeholder="Ürün ara…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          <button className={`adm-btn adm-btn--icon${view === "list" ? " adm-btn--secondary" : " adm-btn--ghost"}`} onClick={() => setView("list")} title="Liste">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13"><line x1="4" y1="4" x2="14" y2="4"/><line x1="4" y1="8" x2="14" y2="8"/><line x1="4" y1="12" x2="14" y2="12"/><circle cx="1.5" cy="4" r="1"/><circle cx="1.5" cy="8" r="1"/><circle cx="1.5" cy="12" r="1"/></svg>
          </button>
          <button className={`adm-btn adm-btn--icon${view === "grid" ? " adm-btn--secondary" : " adm-btn--ghost"}`} onClick={() => setView("grid")} title="Kart">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="adm-card"><div className="adm-empty">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M8 1L14 4.5v7L8 15 2 11.5v-7L8 1z"/></svg>
          <div className="adm-empty__title">Ürün bulunamadı</div>
          Arama kriterini değiştir veya yeni ürün ekle.
        </div></div>
      ) : view === "list" ? (
        <div className="adm-card">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Kategori</th>
                <th>Fiyat</th>
                <th>Ağırlık</th>
                <th>Durum</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.slug}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 6, overflow: "hidden", background: "var(--adm-surface-3)", flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: "var(--adm-text)" }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "var(--adm-text-4)", fontFamily: "var(--adm-mono)" }}>{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="adm-badge adm-badge--muted">{p.category === "protein-bar" ? "Protein Bar" : "Fındık Kreması"}</span></td>
                  <td>
                    <span className="adm-mono adm-font-500" style={{ color: "var(--adm-text)" }}>₺{p.price}</span>
                    {p.compareAtPrice && <span style={{ marginLeft: 6, fontSize: 10, color: "var(--adm-text-4)", textDecoration: "line-through" }}>₺{p.compareAtPrice}</span>}
                  </td>
                  <td className="adm-text-muted">{p.weightGrams}g</td>
                  <td><span className="adm-badge adm-badge--green">aktif</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => openEdit(p)}>Düzenle</button>
                      <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => remove(p.slug)}>Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {filtered.map((p) => (
            <div key={p.slug} className="adm-card adm-card--hover" style={{ cursor: "pointer" }}>
              <div style={{ height: 140, overflow: "hidden", background: "var(--adm-surface-2)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.9 }} />
              </div>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--adm-text)", marginBottom: 3 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "var(--adm-text-3)", marginBottom: 10 }}>{p.category === "protein-bar" ? "Protein Bar" : "Fındık Kreması"}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--adm-mono)", fontWeight: 600, color: "var(--adm-accent)" }}>₺{p.price}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => openEdit(p)}>✎</button>
                    <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => remove(p.slug)}>✕</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {open && editing && (
        <div className="adm-overlay" onClick={() => setOpen(false)}>
          <div className="adm-modal adm-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">{editing.slug ? "Ürünü Düzenle" : "Yeni Ürün"}</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field">
                <label className="adm-label-text">Ürün Adı</label>
                <input className="adm-input" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Tiramisu Fındıklı Protein Bar" />
              </div>
              <div className="adm-field-row">
                <div className="adm-field">
                  <label className="adm-label-text">Kategori</label>
                  <select className="adm-select" value={editing.category}
                    onChange={e => setEditing({ ...editing, category: e.target.value as EP["category"] })}>
                    <option value="protein-bar">Protein Bar</option>
                    <option value="findik-kremasi">Fındık Kreması</option>
                  </select>
                </div>
                <div className="adm-field">
                  <label className="adm-label-text">Aroma</label>
                  <input className="adm-input" value={editing.flavor} onChange={e => setEditing({ ...editing, flavor: e.target.value })} placeholder="Tiramisu" />
                </div>
              </div>
              <div className="adm-field-row">
                <div className="adm-field">
                  <label className="adm-label-text">Fiyat (₺)</label>
                  <input className="adm-input" type="number" value={editing.price} onChange={e => setEditing({ ...editing, price: Number(e.target.value) })} />
                </div>
                <div className="adm-field">
                  <label className="adm-label-text">İndirim Fiyatı (₺)</label>
                  <input className="adm-input" type="number" value={editing.compareAtPrice ?? ""} onChange={e => setEditing({ ...editing, compareAtPrice: e.target.value ? Number(e.target.value) : undefined })} />
                </div>
                <div className="adm-field">
                  <label className="adm-label-text">Net Ağırlık (g)</label>
                  <input className="adm-input" type="number" value={editing.weightGrams} onChange={e => setEditing({ ...editing, weightGrams: Number(e.target.value) })} />
                </div>
              </div>
              <div className="adm-field">
                <label className="adm-label-text">Kısa Açıklama</label>
                <input className="adm-input" value={editing.shortDescription} onChange={e => setEditing({ ...editing, shortDescription: e.target.value })} />
              </div>
              <div className="adm-field">
                <label className="adm-label-text">Detaylı Açıklama</label>
                <textarea className="adm-textarea" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={4} />
              </div>
              <div className="adm-field">
                <label className="adm-label-text">Görsel URL</label>
                <input className="adm-input" value={editing.image} onChange={e => setEditing({ ...editing, image: e.target.value })} />
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn--secondary" onClick={() => setOpen(false)}>İptal</button>
              <button className="adm-btn adm-btn--primary" onClick={save}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
