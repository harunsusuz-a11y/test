"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { CategorySortable } from "@/components/admin/CategorySortable";
import { Folder, Plus, Edit2, Trash2, X, Save, LayoutList, ArrowUpDown } from "lucide-react";

type Category = {
  id: string; name: string; slug: string; description: string | null;
  cover_url: string | null; is_active: boolean; sort_order: number;
  parent_id: string | null; meta_title: string | null; meta_description: string | null;
  created_at: string;
};

const EMPTY_FORM = {
  name:"", slug:"", description:"", cover_url:"", is_active:true,
  parent_id:"", meta_title:"", meta_description:"",
};

export default function KategorilerPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list"|"sort">("list");
  const [modal, setModal] = useState<"create"|"edit"|null>(null);
  const [selected, setSelected] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("sort_order").order("name");
    setCategories((data ?? []) as Category[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setSelected(null); setForm(EMPTY_FORM); setModal("create");
  }
  function openEdit(c: Category) {
    setSelected(c);
    setForm({ name:c.name, slug:c.slug, description:c.description??"", cover_url:c.cover_url??"",
      is_active:c.is_active, parent_id:c.parent_id??"", meta_title:c.meta_title??"", meta_description:c.meta_description??"" });
    setModal("edit");
  }

  async function save() {
    if (!form.name) return;
    setSaving(true);
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""),
      description: form.description || null,
      cover_url: form.cover_url || null,
      is_active: form.is_active,
      parent_id: form.parent_id || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
    };
    if (modal === "edit" && selected) {
      await supabase.from("categories").update(payload).eq("id", selected.id);
    } else {
      await supabase.from("categories").insert({ ...payload, sort_order: categories.length });
    }
    setSaving(false); setModal(null); load();
  }

  async function del(id: string) {
    if (!confirm("Bu kategoriyi silmek istiyor musunuz?")) return;
    await supabase.from("categories").delete().eq("id", id);
    load();
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from("categories").update({ is_active:!current }).eq("id", id);
    load();
  }

  const topLevel = categories.filter(c => !c.parent_id);
  const inputStyle: React.CSSProperties = { background:"#0f0f12", border:"1px solid rgba(255,255,255,0.1)", borderRadius:7, color:"var(--adm-text)", fontSize:13, padding:"8px 12px", width:"100%", boxSizing:"border-box" };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Folder size={22} color="#c8a26b" />
          <span style={{ fontSize:22, fontWeight:700, color:"var(--adm-text)" }}>Kategoriler</span>
          <span style={{ fontSize:13, color:"var(--adm-text-muted)", background:"rgba(0,0,0,0.03)", padding:"3px 10px", borderRadius:20 }}>{categories.length}</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => setView(v => v === "list" ? "sort" : "list")}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:8, border:"1px solid rgba(255,255,255,0.08)", background:"transparent", color:"var(--adm-text-muted)", cursor:"pointer", fontSize:13 }}>
            {view === "sort" ? <><LayoutList size={14}/> Liste</> : <><ArrowUpDown size={14}/> Sırala</>}
          </button>
          <button onClick={openCreate}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, background:"#c8a26b", border:"none", color:"#000", cursor:"pointer", fontWeight:700, fontSize:13 }}>
            <Plus size={14}/> Kategori Ekle
          </button>
        </div>
      </div>

      {loading ? <p style={{ color:"var(--adm-text-muted)" }}>Yükleniyor…</p> : view === "sort" ? (
        <div style={{ background:"var(--adm-surface)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:20 }}>
          <CategorySortable categories={categories} onSaved={load} />
        </div>
      ) : (
        <div style={{ background:"var(--adm-surface)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"rgba(255,255,255,0.02)" }}>
                {["Kategori","Alt Kategori","Durum","SEO","İşlem"].map(h => (
                  <th key={h} style={{ textAlign:"left", padding:"12px 16px", fontSize:12, color:"var(--adm-text-muted)", fontWeight:500, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={5} style={{ padding:48, textAlign:"center", color:"var(--adm-text-muted)" }}>Kategori bulunamadı.</td></tr>
              ) : topLevel.map(cat => {
                const children = categories.filter(c => c.parent_id === cat.id);
                return [
                  <tr key={cat.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        {cat.cover_url && <img src={cat.cover_url} alt="" style={{ width:32, height:32, borderRadius:6, objectFit:"cover" as "cover" }} />}
                        <div>
                          <div style={{ fontSize:14, fontWeight:600, color:"var(--adm-text)" }}>{cat.name}</div>
                          <div style={{ fontSize:11, color:"var(--adm-text-muted)", fontFamily:"monospace" }}>{cat.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"12px 16px", fontSize:13, color:"var(--adm-text-muted)" }}>{children.length} alt kategori</td>
                    <td style={{ padding:"12px 16px" }}>
                      <button onClick={() => toggleActive(cat.id, cat.is_active)}
                        style={{ fontSize:11, padding:"3px 10px", borderRadius:20, border:`1px solid ${cat.is_active ? "#4ade80":"var(--adm-text-muted)"}`, background: cat.is_active ? "rgba(74,222,128,0.1)":"transparent", color: cat.is_active ? "#4ade80":"var(--adm-text-muted)", cursor:"pointer" }}>
                        {cat.is_active ? "Aktif":"Pasif"}
                      </button>
                    </td>
                    <td style={{ padding:"12px 16px", fontSize:12, color: cat.meta_title ? "#4ade80":"#f87171" }}>
                      {cat.meta_title ? "✓ Var" : "✗ Eksik"}
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => openEdit(cat)}
                          style={{ background:"rgba(200,162,107,0.1)", border:"none", borderRadius:6, padding:"5px 9px", color:"#c8a26b", cursor:"pointer" }}>
                          <Edit2 size={13}/>
                        </button>
                        <button onClick={() => del(cat.id)}
                          style={{ background:"rgba(248,113,113,0.1)", border:"none", borderRadius:6, padding:"5px 9px", color:"#f87171", cursor:"pointer" }}>
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </td>
                  </tr>,
                  ...children.map(child => (
                    <tr key={child.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", background:"rgba(255,255,255,0.01)" }}>
                      <td style={{ padding:"10px 16px 10px 40px" }}>
                        <div>
                          <div style={{ fontSize:13, color:"var(--adm-text-muted)" }}>↳ {child.name}</div>
                          <div style={{ fontSize:11, color:"var(--adm-text-muted)", fontFamily:"monospace" }}>{child.slug}</div>
                        </div>
                      </td>
                      <td style={{ padding:"10px 16px", fontSize:12, color:"var(--adm-text-muted)" }}>—</td>
                      <td style={{ padding:"10px 16px" }}>
                        <button onClick={() => toggleActive(child.id, child.is_active)}
                          style={{ fontSize:11, padding:"2px 8px", borderRadius:20, border:`1px solid ${child.is_active ? "#4ade80":"var(--adm-text-muted)"}`, background: child.is_active ? "rgba(74,222,128,0.1)":"transparent", color: child.is_active ? "#4ade80":"var(--adm-text-muted)", cursor:"pointer" }}>
                          {child.is_active ? "Aktif":"Pasif"}
                        </button>
                      </td>
                      <td style={{ padding:"10px 16px", fontSize:12, color: child.meta_title ? "#4ade80":"#f87171" }}>
                        {child.meta_title ? "✓ Var" : "✗ Eksik"}
                      </td>
                      <td style={{ padding:"10px 16px" }}>
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={() => openEdit(child)}
                            style={{ background:"rgba(200,162,107,0.1)", border:"none", borderRadius:6, padding:"4px 8px", color:"#c8a26b", cursor:"pointer" }}>
                            <Edit2 size={12}/>
                          </button>
                          <button onClick={() => del(child.id)}
                            style={{ background:"rgba(248,113,113,0.1)", border:"none", borderRadius:6, padding:"4px 8px", color:"#f87171", cursor:"pointer" }}>
                            <Trash2 size={12}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ];
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}
          onClick={() => setModal(null)}>
          <div style={{ background:"var(--adm-surface)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:28, width:520, maxWidth:"94vw", maxHeight:"90vh", overflowY:"auto" as "auto" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h3 style={{ fontSize:17, fontWeight:700, color:"var(--adm-text)", margin:0 }}>{modal==="edit" ? "Kategoriyi Düzenle":"Yeni Kategori"}</h3>
              <button onClick={() => setModal(null)} style={{ background:"transparent", border:"none", color:"var(--adm-text-muted)", cursor:"pointer" }}><X size={18}/></button>
            </div>
            <div style={{ display:"grid", gap:14 }}>
              <div>
                <label style={{ fontSize:12, color:"var(--adm-text-muted)", display:"block", marginBottom:4 }}>Kategori Adı *</label>
                <input style={inputStyle} value={form.name}
                  onChange={e => { const v=e.target.value; setForm(f => ({...f, name:v, slug:v.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"")})); }}
                  placeholder="Protein Bar" />
              </div>
              <div>
                <label style={{ fontSize:12, color:"var(--adm-text-muted)", display:"block", marginBottom:4 }}>Slug</label>
                <input style={inputStyle} value={form.slug} onChange={e => setForm(f => ({...f, slug:e.target.value}))} />
              </div>
              <div>
                <label style={{ fontSize:12, color:"var(--adm-text-muted)", display:"block", marginBottom:4 }}>Üst Kategori</label>
                <select style={inputStyle} value={form.parent_id} onChange={e => setForm(f => ({...f, parent_id:e.target.value}))}>
                  <option value="">— Ana Kategori —</option>
                  {topLevel.filter(c => c.id !== selected?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, color:"var(--adm-text-muted)", display:"block", marginBottom:4 }}>Açıklama</label>
                <textarea style={{ ...inputStyle, minHeight:60, resize:"vertical" as "vertical" }} value={form.description} onChange={e => setForm(f => ({...f, description:e.target.value}))} />
              </div>
              <div>
                <label style={{ fontSize:12, color:"var(--adm-text-muted)", display:"block", marginBottom:4 }}>Kapak Görseli URL</label>
                <input style={inputStyle} value={form.cover_url} onChange={e => setForm(f => ({...f, cover_url:e.target.value}))} placeholder="/images/kategori.jpg" />
              </div>
              <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:14 }}>
                <p style={{ fontSize:12, fontWeight:600, color:"var(--adm-text-muted)", marginBottom:10 }}>SEO</p>
                <div style={{ display:"grid", gap:10 }}>
                  <input style={inputStyle} value={form.meta_title} onChange={e => setForm(f => ({...f, meta_title:e.target.value}))} placeholder="SEO Başlığı" />
                  <textarea style={{ ...inputStyle, minHeight:60, resize:"vertical" as "vertical" }} value={form.meta_description} onChange={e => setForm(f => ({...f, meta_description:e.target.value}))} placeholder="SEO Açıklaması (150-160 karakter)" />
                </div>
              </div>
              <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:"var(--adm-text-muted)" }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active:e.target.checked}))} style={{ accentColor:"#c8a26b" }} />
                Aktif
              </label>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:24 }}>
              <button onClick={save} disabled={saving}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 24px", borderRadius:8, background:"#c8a26b", border:"none", color:"#000", cursor:saving ? "not-allowed":"pointer", fontWeight:700, fontSize:14, opacity:saving ? .7:1 }}>
                <Save size={15}/>{saving ? "…" : modal==="edit" ? "Güncelle":"Kaydet"}
              </button>
              <button onClick={() => setModal(null)}
                style={{ padding:"10px 18px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"var(--adm-text-muted)", cursor:"pointer" }}>
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
