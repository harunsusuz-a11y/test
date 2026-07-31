"use client";
import React, { useState } from "react";
import { products as INITIAL, type Product } from "@/content/products";

type EditableProduct = Product;

export default function AdminUrunler() {
  const [items, setItems] = useState<EditableProduct[]>(INITIAL as EditableProduct[]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"tümü" | "protein-bar" | "findik-kremasi">("tümü");
  const [editing, setEditing] = useState<EditableProduct | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = items.filter((p) => {
    const matchCat = filter === "tümü" || p.category === filter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function openNew() {
    setEditing({
      slug: "",
      name: "",
      category: "protein-bar",
      flavor: "",
      shortDescription: "",
      description: "",
      weightGrams: 45,
      price: 0,
      compareAtPrice: undefined,
      image: "/images/hero-bars.jpg",
      gallery: [],
      attributes: [],
      highlights: [],
      ingredients: [],
      nutritionPer100g: [],
      usageTips: [],
      faq: [],
      isDemo: true,
    });
    setModalOpen(true);
  }

  function openEdit(p: EditableProduct) {
    setEditing({ ...p });
    setModalOpen(true);
  }

  function save() {
    if (!editing) return;
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.slug === editing.slug);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = editing;
        return next;
      }
      return [...prev, { ...editing, slug: editing.slug || editing.name.toLowerCase().replace(/\s+/g, "-") }];
    });
    setModalOpen(false);
    setEditing(null);
  }

  function remove(slug: string) {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    setItems((prev) => prev.filter((p) => p.slug !== slug));
  }

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Ürünler</div>
          <div className="adm-page-sub">{items.length} ürün · tüm kategoriler</div>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={openNew}>+ Yeni Ürün</button>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <div className="adm-tabs">
          {(["tümü", "protein-bar", "findik-kremasi"] as const).map((cat) => (
            <button key={cat} className={`adm-tab${filter === cat ? " active" : ""}`} onClick={() => setFilter(cat)}>
              {cat === "tümü" ? "Tümü" : cat === "protein-bar" ? "Protein Bar" : "Fındık Kreması"}
            </button>
          ))}
        </div>
        <div className="adm-search" style={{ maxWidth: 240 }}>
          <span className="adm-search__icon">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6.5" cy="6.5" r="5"/><line x1="11" y1="11" x2="15" y2="15"/></svg>
          </span>
          <input className="adm-input" placeholder="Ürün ara…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="adm-card">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Ürün</th><th>Kategori</th><th>Fiyat</th><th>Eski Fiyat</th><th>Ağırlık</th><th>Durum</th><th style={{ textAlign: "right" }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7}><div className="adm-empty"><div className="adm-empty__icon">📦</div><div className="adm-empty__title">Ürün bulunamadı</div></div></td></tr>
            )}
            {filtered.map((p) => (
              <tr key={p.slug}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 5, overflow: "hidden", background: "var(--adm-surface-3)", flexShrink: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.9 }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 12 }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: "var(--adm-text-3)", fontFamily: "var(--adm-mono)" }}>{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td><span className={`adm-badge ${p.category === "protein-bar" ? "adm-badge--blue" : "adm-badge--accent"}`}>{p.category === "protein-bar" ? "Bar" : "Krema"}</span></td>
                <td style={{ fontWeight: 500 }}>₺{p.price.toFixed(2)}</td>
                <td style={{ color: "var(--adm-text-3)", textDecoration: "line-through" }}>{p.compareAtPrice ? `₺${p.compareAtPrice.toFixed(2)}` : "—"}</td>
                <td style={{ color: "var(--adm-text-2)" }}>{p.weightGrams}g</td>
                <td><span className="adm-badge adm-badge--green">aktif</span></td>
                <td style={{ textAlign: "right" }}>
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

      {modalOpen && editing && (
        <div className="adm-overlay" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="adm-modal" style={{ maxWidth: 580 }}>
            <div className="adm-modal__header">
              <span style={{ fontWeight: 600 }}>{editing.slug ? "Ürün Düzenle" : "Yeni Ürün"}</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setModalOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" fill="none"><line x1="2" y1="2" x2="14" y2="14"/><line x1="14" y1="2" x2="2" y2="14"/></svg>
              </button>
            </div>
            <div className="adm-modal__body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="adm-field">
                <label>Ürün Adı</label>
                <input className="adm-input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="adm-grid-2">
                <div className="adm-field">
                  <label>Kategori</label>
                  <select className="adm-input adm-select" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as Product["category"] })}>
                    <option value="protein-bar">Protein Bar</option>
                    <option value="findik-kremasi">Fındık Kreması</option>
                  </select>
                </div>
                <div className="adm-field">
                  <label>Aroma / Çeşit</label>
                  <input className="adm-input" value={editing.flavor} onChange={(e) => setEditing({ ...editing, flavor: e.target.value })} />
                </div>
              </div>
              <div className="adm-grid-3">
                <div className="adm-field">
                  <label>Fiyat (₺)</label>
                  <input className="adm-input" type="number" step="0.01" value={editing.price} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="adm-field">
                  <label>Eski Fiyat (₺)</label>
                  <input className="adm-input" type="number" step="0.01" value={editing.compareAtPrice ?? ""} onChange={(e) => setEditing({ ...editing, compareAtPrice: e.target.value ? parseFloat(e.target.value) : undefined })} />
                </div>
                <div className="adm-field">
                  <label>Ağırlık (g)</label>
                  <input className="adm-input" type="number" value={editing.weightGrams} onChange={(e) => setEditing({ ...editing, weightGrams: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="adm-field">
                <label>Kısa Açıklama</label>
                <input className="adm-input" value={editing.shortDescription} onChange={(e) => setEditing({ ...editing, shortDescription: e.target.value })} />
              </div>
              <div className="adm-field">
                <label>Detaylı Açıklama</label>
                <textarea className="adm-input adm-textarea" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="adm-field">
                <label>Görsel URL</label>
                <input className="adm-input" value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} />
              </div>
            </div>
            <div className="adm-modal__footer">
              <button className="adm-btn adm-btn--secondary" onClick={() => setModalOpen(false)}>İptal</button>
              <button className="adm-btn adm-btn--primary" onClick={save}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
