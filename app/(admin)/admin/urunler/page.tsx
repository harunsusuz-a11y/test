"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string; name: string; slug: string; sku: string | null;
  price: number; compare_at_price: number | null; cost_price: number | null;
  status: string; is_featured: boolean; is_new: boolean; is_bestseller: boolean;
  category_id: string | null; brand_id: string | null;
  main_image_url: string | null; short_description: string | null;
  meta_title: string | null; meta_description: string | null;
  weight: number | null; created_at: string;
  category?: { name: string } | null;
  brand?: { name: string } | null;
}
interface Category { id: string; name: string; }
interface Brand { id: string; name: string; }

const EMPTY = {
  name:"", slug:"", sku:"", price:"", compare_at_price:"", cost_price:"",
  status:"active", is_featured:false, is_new:false, is_bestseller:false,
  category_id:"", brand_id:"", main_image_url:"", short_description:"",
  meta_title:"", meta_description:"", weight:"",
};

export default function AdminUrunler() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"genel"|"seo"|"flags">("genel");
  const [editing, setEditing] = useState(EMPTY);
  const [editId, setEditId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data:p }, { data:c }, { data:b }] = await Promise.all([
      supabase.from("products").select("*, category:category_id(name), brand:brand_id(name)")
        .is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("categories").select("id,name").is("deleted_at", null).order("name"),
      supabase.from("brands").select("id,name").is("deleted_at", null).order("name"),
    ]);
    setProducts((p as Product[]) || []);
    setCategories((c as Category[]) || []);
    setBrands((b as Brand[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function slugify(s: string) {
    return s.toLowerCase()
      .replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s")
      .replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c")
      .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  }

  function openNew() {
    setEditing(EMPTY); setEditId(null); setActiveTab("genel"); setOpen(true);
  }
  function openEdit(p: Product) {
    setEditing({
      name: p.name, slug: p.slug, sku: p.sku||"",
      price: String(p.price), compare_at_price: p.compare_at_price!=null?String(p.compare_at_price):"",
      cost_price: p.cost_price!=null?String(p.cost_price):"",
      status: p.status, is_featured: p.is_featured, is_new: p.is_new, is_bestseller: p.is_bestseller,
      category_id: p.category_id||"", brand_id: p.brand_id||"",
      main_image_url: p.main_image_url||"", short_description: p.short_description||"",
      meta_title: p.meta_title||"", meta_description: p.meta_description||"",
      weight: p.weight!=null?String(p.weight):"",
    });
    setEditId(p.id); setActiveTab("genel"); setOpen(true);
  }

  async function save() {
    if (!editing.name || !editing.price) return;
    setSaving(true);
    const { data:{ user } } = await supabase.auth.getUser();
    const payload = {
      name: editing.name,
      slug: editing.slug || slugify(editing.name),
      sku: editing.sku||null,
      price: Number(editing.price),
      compare_at_price: editing.compare_at_price?Number(editing.compare_at_price):null,
      cost_price: editing.cost_price?Number(editing.cost_price):null,
      status: editing.status,
      is_featured: editing.is_featured, is_new: editing.is_new, is_bestseller: editing.is_bestseller,
      category_id: editing.category_id||null, brand_id: editing.brand_id||null,
      main_image_url: editing.main_image_url||null,
      short_description: editing.short_description||null,
      meta_title: editing.meta_title||null, meta_description: editing.meta_description||null,
      weight: editing.weight?Number(editing.weight):null,
    };
    if (editId) {
      await supabase.from("products").update({ ...payload, updated_by: user?.id }).eq("id", editId);
    } else {
      await supabase.from("products").insert({ ...payload, created_by: user?.id });
    }
    setSaving(false); setOpen(false); load();
  }

  async function remove(id: string) {
    if (!confirm("Ürün arşivlensin mi?")) return;
    await supabase.from("products").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    load();
  }

  async function toggleStatus(id: string, status: string) {
    const next = status === "active" ? "inactive" : "active";
    await supabase.from("products").update({ status: next }).eq("id", id);
    setProducts(prev => prev.map(p => p.id===id ? { ...p, status: next } : p));
  }

  const filtered = products.filter(p => {
    const ms = statusFilter==="all" || p.status===statusFilter;
    const q = search.toLowerCase();
    const mq = !q || p.name.toLowerCase().includes(q) || (p.sku||"").toLowerCase().includes(q);
    return ms && mq;
  });

  const counts = { active: products.filter(p=>p.status==="active").length, inactive: products.filter(p=>p.status==="inactive").length, draft: products.filter(p=>p.status==="draft").length };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Ürünler</div>
          <div className="adm-page-sub">{products.length} ürün · {counts.active} aktif</div>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={openNew}>+ Yeni Ürün</button>
      </div>

      <div className="adm-kpi-grid" style={{ marginBottom: 20 }}>
        {[
          { label:"Toplam", value:products.length, color:"var(--adm-text)" },
          { label:"Aktif",  value:counts.active,   color:"var(--adm-green)" },
          { label:"Pasif",  value:counts.inactive, color:"var(--adm-text-3)" },
          { label:"Taslak", value:counts.draft,    color:"var(--adm-yellow)" },
        ].map((k,i) => (
          <div key={i} className="adm-stat">
            <div className="adm-stat__label">{k.label}</div>
            <div className="adm-stat__value" style={{ fontSize:22, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <div className="adm-tabs">
          {[["all","Tümü"],["active","Aktif"],["inactive","Pasif"],["draft","Taslak"]].map(([k,l]) => (
            <button key={k} className={`adm-tab${statusFilter===k?" active":""}`} onClick={() => setStatusFilter(k)}>{l}</button>
          ))}
        </div>
        <div className="adm-search" style={{ flex:1, maxWidth:320 }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/></svg>
          <input className="adm-input" placeholder="Ürün adı veya SKU…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="adm-card">
        {loading ? <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div> : (
          <table className="adm-table">
            <thead>
              <tr><th>Ürün</th><th>SKU</th><th>Kategori</th><th>Fiyat</th><th>Maliyet</th><th>Durum</th><th>Etiketler</th><th /></tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:6, overflow:"hidden", background:"var(--adm-surface-3)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {p.main_image_url
                          ? <img src={p.main_image_url} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
                          : <span style={{ fontSize:14 }}>📦</span>
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight:500, color:"var(--adm-text)", fontSize:13 }}>{p.name}</div>
                        <div style={{ fontSize:10, color:"var(--adm-text-4)", fontFamily:"var(--adm-mono)" }}>{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="adm-mono adm-text-muted" style={{ fontSize:11 }}>{p.sku||"—"}</td>
                  <td className="adm-text-muted" style={{ fontSize:12 }}>{(p.category as any)?.name||"—"}</td>
                  <td>
                    <div>
                      <span className="adm-mono adm-font-500">₺{Number(p.price).toFixed(2)}</span>
                      {p.compare_at_price && <div style={{ fontSize:10, color:"var(--adm-text-4)", textDecoration:"line-through" }}>₺{Number(p.compare_at_price).toFixed(2)}</div>}
                    </div>
                  </td>
                  <td className="adm-mono adm-text-muted" style={{ fontSize:11 }}>{p.cost_price!=null?`₺${Number(p.cost_price).toFixed(2)}`:"—"}</td>
                  <td>
                    <div className={`adm-toggle${p.status==="active"?" on":""}`} onClick={() => toggleStatus(p.id, p.status)} />
                  </td>
                  <td>
                    <div style={{ display:"flex", gap:3, flexWrap:"wrap" }}>
                      {p.is_featured && <span className="adm-badge adm-badge--accent" style={{ fontSize:9 }}>⭐ Öne Çıkan</span>}
                      {p.is_new && <span className="adm-badge adm-badge--blue" style={{ fontSize:9 }}>Yeni</span>}
                      {p.is_bestseller && <span className="adm-badge adm-badge--green" style={{ fontSize:9 }}>🔥 Çok Satan</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display:"flex", gap:4, justifyContent:"flex-end" }}>
                      <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => openEdit(p)}>Düzenle</button>
                      <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => remove(p.id)}>Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={8}><div className="adm-empty"><div className="adm-empty__title">Ürün bulunamadı</div></div></td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="adm-overlay" onClick={() => setOpen(false)}>
          <div className="adm-modal adm-modal--lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">{editId ? "Ürün Düzenle" : "Yeni Ürün"}</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* Tab nav */}
            <div style={{ display:"flex", gap:2, padding:"0 20px", borderBottom:"1px solid var(--adm-border)" }}>
              {(["genel","seo","flags"] as const).map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  padding:"8px 14px", fontSize:12, border:"none", background:"none", cursor:"pointer",
                  color: activeTab===t?"var(--adm-text)":"var(--adm-text-3)",
                  borderBottom: activeTab===t?"2px solid var(--adm-accent)":"2px solid transparent",
                  fontFamily:"var(--adm-font)", fontWeight: activeTab===t?600:400,
                }}>
                  {t==="genel"?"Genel":t==="seo"?"SEO & Meta":"Etiketler"}
                </button>
              ))}
            </div>

            <div className="adm-modal-body">
              {activeTab==="genel" && <>
                <div className="adm-field-row">
                  <div className="adm-field">
                    <label className="adm-label-text">Ürün Adı *</label>
                    <input className="adm-input" value={editing.name}
                      onChange={e => setEditing({ ...editing, name:e.target.value, slug:slugify(e.target.value) })} />
                  </div>
                  <div className="adm-field">
                    <label className="adm-label-text">Slug</label>
                    <input className="adm-input" value={editing.slug}
                      onChange={e => setEditing({ ...editing, slug:e.target.value })} />
                  </div>
                </div>
                <div className="adm-field-row">
                  <div className="adm-field">
                    <label className="adm-label-text">SKU</label>
                    <input className="adm-input" style={{ fontFamily:"var(--adm-mono)" }} value={editing.sku}
                      onChange={e => setEditing({ ...editing, sku:e.target.value })} placeholder="VPB-001" />
                  </div>
                  <div className="adm-field">
                    <label className="adm-label-text">Durum</label>
                    <select className="adm-select" value={editing.status} onChange={e => setEditing({ ...editing, status:e.target.value })}>
                      <option value="active">Aktif</option>
                      <option value="inactive">Pasif</option>
                      <option value="draft">Taslak</option>
                    </select>
                  </div>
                </div>
                <div className="adm-field-row">
                  <div className="adm-field">
                    <label className="adm-label-text">Satış Fiyatı (₺) *</label>
                    <input className="adm-input" type="number" step="0.01" value={editing.price}
                      onChange={e => setEditing({ ...editing, price:e.target.value })} />
                  </div>
                  <div className="adm-field">
                    <label className="adm-label-text">Karşılaştırma Fiyatı (₺)</label>
                    <input className="adm-input" type="number" step="0.01" value={editing.compare_at_price}
                      onChange={e => setEditing({ ...editing, compare_at_price:e.target.value })} />
                  </div>
                  <div className="adm-field">
                    <label className="adm-label-text">Maliyet (₺)</label>
                    <input className="adm-input" type="number" step="0.01" value={editing.cost_price}
                      onChange={e => setEditing({ ...editing, cost_price:e.target.value })} />
                  </div>
                </div>
                <div className="adm-field-row">
                  <div className="adm-field">
                    <label className="adm-label-text">Kategori</label>
                    <select className="adm-select" value={editing.category_id} onChange={e => setEditing({ ...editing, category_id:e.target.value })}>
                      <option value="">— Seç —</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label className="adm-label-text">Marka</label>
                    <select className="adm-select" value={editing.brand_id} onChange={e => setEditing({ ...editing, brand_id:e.target.value })}>
                      <option value="">— Seç —</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label className="adm-label-text">Ağırlık (g)</label>
                    <input className="adm-input" type="number" value={editing.weight}
                      onChange={e => setEditing({ ...editing, weight:e.target.value })} placeholder="45" />
                  </div>
                </div>
                <div className="adm-field">
                  <label className="adm-label-text">Ana Görsel URL</label>
                  <div style={{ display:"flex", gap:8 }}>
                    <input className="adm-input" value={editing.main_image_url}
                      onChange={e => setEditing({ ...editing, main_image_url:e.target.value })} placeholder="https://…" />
                    {editing.main_image_url && (
                      <img src={editing.main_image_url} alt="" style={{ width:40, height:40, objectFit:"cover", borderRadius:6, border:"1px solid var(--adm-border)", flexShrink:0 }}
                        onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
                    )}
                  </div>
                </div>
                <div className="adm-field">
                  <label className="adm-label-text">Kısa Açıklama</label>
                  <textarea className="adm-textarea" rows={2} value={editing.short_description}
                    onChange={e => setEditing({ ...editing, short_description:e.target.value })} />
                </div>
              </>}

              {activeTab==="seo" && <>
                <div className="adm-field">
                  <label className="adm-label-text">SEO Başlık</label>
                  <input className="adm-input" value={editing.meta_title} onChange={e => setEditing({ ...editing, meta_title:e.target.value })} maxLength={60} />
                  <div style={{ fontSize:10, color: editing.meta_title.length>55?"var(--adm-yellow)":"var(--adm-text-4)", marginTop:4 }}>{editing.meta_title.length}/60</div>
                </div>
                <div className="adm-field">
                  <label className="adm-label-text">SEO Açıklama</label>
                  <textarea className="adm-textarea" rows={3} value={editing.meta_description} onChange={e => setEditing({ ...editing, meta_description:e.target.value })} maxLength={160} />
                  <div style={{ fontSize:10, color: editing.meta_description.length>150?"var(--adm-yellow)":"var(--adm-text-4)", marginTop:4 }}>{editing.meta_description.length}/160</div>
                </div>
                {/* Google önizleme */}
                <div style={{ background:"var(--adm-surface-2)", border:"1px solid var(--adm-border)", borderRadius:8, padding:14, marginTop:4 }}>
                  <div style={{ fontSize:10, color:"var(--adm-text-4)", marginBottom:6 }}>Google önizleme</div>
                  <div style={{ fontSize:14, color:"#8ab4f8", fontWeight:500, marginBottom:2 }}>
                    {editing.meta_title || editing.name || "Ürün başlığı"}
                  </div>
                  <div style={{ fontSize:12, color:"#4caf50", marginBottom:4 }}>
                    ventiate.com/urun/{editing.slug || "urun-slug"}
                  </div>
                  <div style={{ fontSize:12, color:"var(--adm-text-3)", lineHeight:1.5 }}>
                    {editing.meta_description || editing.short_description || "Ürün açıklaması buraya gelecek…"}
                  </div>
                </div>
              </>}

              {activeTab==="flags" && <>
                <div style={{ display:"flex", flexDirection:"column", gap:16, padding:"4px 0" }}>
                  {[
                    { key:"is_featured",   label:"⭐ Öne Çıkan",  desc:"Ana sayfada ve koleksiyonlarda öne çıkar" },
                    { key:"is_new",        label:"🆕 Yeni Ürün",  desc:"'Yeni' badge'i gösterilir" },
                    { key:"is_bestseller", label:"🔥 Çok Satan",  desc:"Bestseller badge'i gösterilir" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", background:"var(--adm-surface-2)", borderRadius:8, border:"1px solid var(--adm-border)" }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:500, color:"var(--adm-text)" }}>{label}</div>
                        <div style={{ fontSize:11, color:"var(--adm-text-4)", marginTop:2 }}>{desc}</div>
                      </div>
                      <div className={`adm-toggle${editing[key as keyof typeof editing]?" on":""}`}
                        onClick={() => setEditing({ ...editing, [key]: !editing[key as keyof typeof editing] })} />
                    </div>
                  ))}
                </div>
              </>}
            </div>

            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn--secondary" onClick={() => setOpen(false)}>İptal</button>
              <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>
                {saving ? "Kaydediliyor…" : editId ? "Güncelle" : "Oluştur"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
