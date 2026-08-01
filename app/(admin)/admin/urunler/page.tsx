"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Product { id:string; name:string; slug:string; sku:string|null; price:number; compare_at_price:number|null; status:string; is_featured:boolean; is_new:boolean; category_id:string|null; brand_id:string|null; main_image_url:string|null; created_at:string; category?:{name:string}|null; brand?:{name:string}|null; }
interface Category { id:string; name:string; }
interface Brand { id:string; name:string; }

const EMPTY = { name:"", slug:"", sku:"", price:"", compare_at_price:"", status:"active", is_featured:false, is_new:false, category_id:"", brand_id:"", main_image_url:"", short_description:"", description:"" };

export default function AdminUrunler() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(EMPTY);
  const [editId, setEditId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data:p },{ data:c },{ data:b }] = await Promise.all([
      supabase.from("products").select("*, category:category_id(name), brand:brand_id(name)").is("deleted_at",null).order("created_at",{ascending:false}),
      supabase.from("categories").select("id,name").is("deleted_at",null).order("name"),
      supabase.from("brands").select("id,name").is("deleted_at",null).order("name"),
    ]);
    setProducts((p as Product[]) || []);
    setCategories((c as Category[]) || []);
    setBrands((b as Brand[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function slugify(s:string) { return s.toLowerCase().replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }

  async function save() {
    if (!editing.name || !editing.price) return;
    setSaving(true);
    const { data:{user} } = await supabase.auth.getUser();
    const payload = {
      name:editing.name, slug:editing.slug||slugify(editing.name),
      sku:editing.sku||null, price:Number(editing.price),
      compare_at_price:editing.compare_at_price?Number(editing.compare_at_price):null,
      status:editing.status, is_featured:editing.is_featured, is_new:editing.is_new,
      category_id:editing.category_id||null, brand_id:editing.brand_id||null,
      main_image_url:editing.main_image_url||null,
      short_description:(editing as any).short_description||null,
      description:(editing as any).description||null,
      updated_by:user?.id,
    };
    if (editId) await supabase.from("products").update(payload).eq("id",editId);
    else await supabase.from("products").insert({...payload, created_by:user?.id});
    setSaving(false); setOpen(false); load();
  }

  async function remove(id:string) {
    if (!confirm("Ürün silinsin mi?")) return;
    await supabase.from("products").update({ deleted_at:new Date().toISOString() }).eq("id",id);
    load();
  }

  async function toggleStatus(id:string, status:string) {
    const next = status==="active"?"inactive":"active";
    await supabase.from("products").update({ status:next }).eq("id",id);
    setProducts(prev => prev.map(p => p.id===id?{...p,status:next}:p));
  }

  const filtered = products.filter(p => {
    const ms = statusFilter==="all" || p.status===statusFilter;
    const mq = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku||"").toLowerCase().includes(search.toLowerCase());
    return ms && mq;
  });

  const STATUS_BADGE: Record<string,string> = { active:"adm-badge--green", inactive:"adm-badge--muted", draft:"adm-badge--yellow" };

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">Ürünler</div><div className="adm-page-sub">{products.length} ürün · {filtered.length} listeleniyor</div></div>
        <button className="adm-btn adm-btn--primary" onClick={() => { setEditing(EMPTY); setEditId(null); setOpen(true); }}>+ Yeni Ürün</button>
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <div className="adm-tabs">
          {[["all","Tümü"],["active","Aktif"],["inactive","Pasif"],["draft","Taslak"]].map(([k,l]) => (
            <button key={k} className={`adm-tab${statusFilter===k?" active":""}`} onClick={() => setStatusFilter(k)}>{l}</button>
          ))}
        </div>
        <div className="adm-search" style={{ flex:1, maxWidth:300 }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/></svg>
          <input className="adm-input" placeholder="Ürün adı veya SKU…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="adm-card">
        {loading ? <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div> : (
          <table className="adm-table">
            <thead><tr><th>Ürün</th><th>SKU</th><th>Kategori</th><th>Fiyat</th><th>Durum</th><th>Özellikler</th><th /></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:6, overflow:"hidden", background:"var(--adm-surface-3)", flexShrink:0 }}>
                        {p.main_image_url && <img src={p.main_image_url} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />}
                      </div>
                      <div>
                        <div style={{ fontWeight:500, color:"var(--adm-text)" }}>{p.name}</div>
                        <div style={{ fontSize:10, color:"var(--adm-text-4)", fontFamily:"var(--adm-mono)" }}>{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="adm-mono adm-text-muted" style={{ fontSize:11 }}>{p.sku||"—"}</td>
                  <td className="adm-text-muted">{(p.category as any)?.name||"—"}</td>
                  <td>
                    <span className="adm-mono adm-font-500" style={{ color:"var(--adm-text)" }}>₺{p.price}</span>
                    {p.compare_at_price && <span style={{ marginLeft:6, fontSize:10, color:"var(--adm-text-4)", textDecoration:"line-through" }}>₺{p.compare_at_price}</span>}
                  </td>
                  <td>
                    <div className={`adm-toggle${p.status==="active"?" on":""}`} onClick={() => toggleStatus(p.id,p.status)} />
                  </td>
                  <td>
                    <div style={{ display:"flex", gap:4 }}>
                      {p.is_featured && <span className="adm-badge adm-badge--accent" style={{ fontSize:9 }}>Öne Çıkan</span>}
                      {p.is_new && <span className="adm-badge adm-badge--blue" style={{ fontSize:9 }}>Yeni</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display:"flex", gap:4, justifyContent:"flex-end" }}>
                      <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => {
                        setEditing({ name:p.name, slug:p.slug, sku:p.sku||"", price:p.price.toString(), compare_at_price:p.compare_at_price?.toString()||"", status:p.status, is_featured:p.is_featured, is_new:p.is_new, category_id:p.category_id||"", brand_id:p.brand_id||"", main_image_url:p.main_image_url||"", short_description:"", description:"" });
                        setEditId(p.id); setOpen(true);
                      }}>Düzenle</button>
                      <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => remove(p.id)}>Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={7}><div className="adm-empty"><div className="adm-empty__title">Ürün bulunamadı</div></div></td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="adm-overlay" onClick={() => setOpen(false)}>
          <div className="adm-modal adm-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">{editId?"Ürün Düzenle":"Yeni Ürün"}</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">Ad</label><input className="adm-input" value={editing.name} onChange={e => setEditing({...editing,name:e.target.value,slug:slugify(e.target.value)})} /></div>
                <div className="adm-field"><label className="adm-label-text">Slug</label><input className="adm-input" value={editing.slug} onChange={e => setEditing({...editing,slug:e.target.value})} /></div>
              </div>
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">SKU</label><input className="adm-input" value={editing.sku} onChange={e => setEditing({...editing,sku:e.target.value})} /></div>
                <div className="adm-field"><label className="adm-label-text">Durum</label>
                  <select className="adm-select" value={editing.status} onChange={e => setEditing({...editing,status:e.target.value})}>
                    <option value="active">Aktif</option><option value="inactive">Pasif</option><option value="draft">Taslak</option>
                  </select>
                </div>
              </div>
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">Fiyat (₺)</label><input className="adm-input" type="number" value={editing.price} onChange={e => setEditing({...editing,price:e.target.value})} /></div>
                <div className="adm-field"><label className="adm-label-text">İndirim Fiyatı (₺)</label><input className="adm-input" type="number" value={editing.compare_at_price} onChange={e => setEditing({...editing,compare_at_price:e.target.value})} /></div>
              </div>
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">Kategori</label>
                  <select className="adm-select" value={editing.category_id} onChange={e => setEditing({...editing,category_id:e.target.value})}>
                    <option value="">— Seç —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="adm-field"><label className="adm-label-text">Marka</label>
                  <select className="adm-select" value={editing.brand_id} onChange={e => setEditing({...editing,brand_id:e.target.value})}>
                    <option value="">— Seç —</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="adm-field"><label className="adm-label-text">Görsel URL</label><input className="adm-input" value={editing.main_image_url} onChange={e => setEditing({...editing,main_image_url:e.target.value})} /></div>
              <div className="adm-field"><label className="adm-label-text">Kısa Açıklama</label><input className="adm-input" value={(editing as any).short_description} onChange={e => setEditing({...editing,short_description:e.target.value} as any)} /></div>
              <div className="adm-field"><label className="adm-label-text">Açıklama</label><textarea className="adm-textarea" rows={3} value={(editing as any).description} onChange={e => setEditing({...editing,description:e.target.value} as any)} /></div>
              <div style={{ display:"flex", gap:20 }}>
                {[{k:"is_featured",l:"Öne Çıkan"},{k:"is_new",l:"Yeni"}].map(({k,l}) => (
                  <div key={k} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div className={`adm-toggle${editing[k as keyof typeof editing]?" on":""}`} onClick={() => setEditing({...editing,[k]:!editing[k as keyof typeof editing]})} />
                    <span style={{ fontSize:12, color:"var(--adm-text-2)" }}>{l}</span>
                  </div>
                ))}
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
