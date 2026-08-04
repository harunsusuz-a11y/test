"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable, type BulkAction } from "@/components/admin/ui/DataTable";
import { ProductVariants } from "@/components/admin/ProductVariants";
import type { ColumnDef } from "@tanstack/react-table";
import { Package, Plus, Upload, Edit2, Copy, Archive, X, Save } from "lucide-react";
import { useToast } from "@/components/admin/ui/Toast";
import { SkeletonTable } from "@/components/admin/ui/Skeleton";
import Image from "next/image";

type Product = {
  id: string; name: string; slug: string; price: number; compare_at_price: number | null;
  status: string; is_featured: boolean; is_bestseller: boolean;
  main_image_url: string | null; short_description: string | null;
  protein_percent: number | null; hazelnut_percent: number | null; created_at: string;
};

const STATUS_COLORS: Record<string,string> = { active:"#4ade80", inactive:"#f59e0b", draft:"#9b9ba4" };
const STATUS_TR: Record<string,string> = { active:"Aktif", inactive:"Pasif", draft:"Taslak" };

const EMPTY_FORM = {
  name:"", slug:"", short_description:"", price:"", compare_at_price:"",
  status:"active", is_featured:false, is_bestseller:false,
};

export default function UrunlerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState<"create"|"edit"|"variants"|null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { success, error: toastError } = useToast();
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const PAGE_SIZE = 20;
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("products")
      .select("*", { count:"exact" })
      .is("deleted_at", null)
      .order("created_at", { ascending:false })
      .range((page-1)*PAGE_SIZE, page*PAGE_SIZE-1);
    if (statusFilter) q = q.eq("status", statusFilter);
    if (search) q = q.ilike("name", `%${search}%`);
    const { data, count } = await q;
    setProducts((data ?? []) as Product[]);
    setTotal(count ?? 0);
    setLoading(false);
  }, [supabase, page, statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setSelected(null); setForm(EMPTY_FORM); setModal("create");
  }
  function openEdit(p: Product) {
    setSelected(p);
    setForm({ name:p.name, slug:p.slug, short_description:p.short_description??"", price:String(p.price),
      compare_at_price:String(p.compare_at_price??""), status:p.status, is_featured:p.is_featured, is_bestseller:p.is_bestseller });
    setModal("edit");
  }
  function openVariants(p: Product) { setSelected(p); setModal("variants"); }

  async function save() {
    if (!form.name || !form.price) return;
    setSaving(true);
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""),
      short_description: form.short_description || null,
      price: parseFloat(form.price),
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      status: form.status, is_featured: form.is_featured, is_bestseller: form.is_bestseller,
    };
    if (modal === "edit" && selected) {
      await supabase.from("products").update({ ...payload, updated_at:new Date().toISOString() }).eq("id", selected.id);
    } else {
      await supabase.from("products").insert(payload);
    }
    setSaving(false); setModal(null); success(modal==="edit" ? "Ürün güncellendi" : "Ürün oluşturuldu"); load();
  }

  async function duplicate(p: Product) {
    await supabase.from("products").insert({
      ...p, id: undefined, slug: `${p.slug}-kopya-${Date.now()}`,
      name: `${p.name} (Kopya)`, status:"draft", created_at: new Date().toISOString(),
    });
    load();
  }

  async function archive(id: string) {
    if (!confirm("Ürün arşivlensin mi?")) return;
    await supabase.from("products").update({ status:"inactive" }).eq("id", id);
    load();
  }

  async function bulkDelete(ids: string[]) {
    if (!confirm(`${ids.length} ürün silinsin mi?`)) return;
    await supabase.from("products").update({ deleted_at:new Date().toISOString() }).in("id", ids);
    load();
  }

  async function bulkStatus(ids: string[], status: string) {
    await supabase.from("products").update({ status }).in("id", ids);
    load();
  }

  // CSV import
  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const text = await file.text();
    const lines = text.split("\n").filter(Boolean);
    const headers = lines[0].split(",").map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      const vals = line.split(",");
      return Object.fromEntries(headers.map((h,i) => [h, vals[i]?.trim() ?? ""]));
    });
    for (const row of rows) {
      if (!row.name) continue;
      await supabase.from("products").upsert({
        name: row.name,
        slug: row.slug || row.name.toLowerCase().replace(/\s+/g,"-"),
        price: parseFloat(row.price) || 0,
        status: row.status || "draft",
        short_description: row.short_description || null,
      }, { onConflict:"slug" });
    }
    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
    load();
  }

  function exportCSV() {
    const rows = ["Ad,Slug,Fiyat,Durum,Öne Çıkan,Çok Satan,Tarih",
      ...products.map(p => `"${p.name}",${p.slug},${p.price},${STATUS_TR[p.status]??p.status},${p.is_featured?"Evet":"Hayır"},${p.is_bestseller?"Evet":"Hayır"},${new Date(p.created_at).toLocaleDateString("tr-TR")}`)
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF"+rows], { type:"text/csv;charset=utf-8" }));
    a.download = "urunler.csv"; a.click();
  }

  const columns: ColumnDef<Product, unknown>[] = [
    { accessorKey: "name", header: "Ürün",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {p.main_image_url ? (
              <div style={{ width:40, height:40, borderRadius:8, overflow:"hidden", flexShrink:0, position:"relative" }}>
                <Image src={p.main_image_url} alt={p.name} fill style={{ objectFit:"cover" }} sizes="40px" />
              </div>
            ) : (
              <div style={{ width:40, height:40, borderRadius:8, background:"rgba(255,255,255,0.05)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Package size={18} color="#3a3a45" />
              </div>
            )}
            <div>
              <div style={{ fontWeight:500 }}>{p.name}</div>
              <div style={{ fontSize:11, color:"#6b6b76", fontFamily:"monospace" }}>{p.slug}</div>
            </div>
          </div>
        );
      }},
    { accessorKey: "price", header: "Fiyat", enableSorting: true,
      cell: ({ row }) => (
        <div>
          <div style={{ fontWeight:600 }}>₺{Number(row.original.price).toFixed(2)}</div>
          {row.original.compare_at_price && <div style={{ fontSize:11, color:"#6b6b76", textDecoration:"line-through" }}>₺{Number(row.original.compare_at_price).toFixed(2)}</div>}
        </div>
      )},
    { accessorKey: "status", header: "Durum",
      cell: ({ getValue }) => {
        const s = getValue() as string;
        return <span style={{ fontSize:12, fontWeight:600, color:STATUS_COLORS[s]??"#9b9ba4",
          background:`${STATUS_COLORS[s]??"#9b9ba4"}18`, padding:"3px 10px", borderRadius:20 }}>
          {STATUS_TR[s] ?? s}
        </span>;
      }},
    { id:"badges", header: "Etiket",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div style={{ display:"flex", gap:4, flexWrap:"wrap" as "wrap" }}>
            {p.is_featured && <span style={{ fontSize:10, background:"rgba(200,162,107,0.15)", color:"#c8a26b", padding:"2px 7px", borderRadius:10, fontWeight:600 }}>Öne Çıkan</span>}
            {p.is_bestseller && <span style={{ fontSize:10, background:"rgba(74,222,128,0.1)", color:"#4ade80", padding:"2px 7px", borderRadius:10, fontWeight:600 }}>Çok Satan</span>}
          </div>
        );
      }},
    { accessorKey: "created_at", header: "Tarih", enableSorting: true,
      cell: ({ getValue }) => <span style={{ fontSize:12, color:"#6b6b76" }}>{new Date(getValue() as string).toLocaleDateString("tr-TR")}</span> },
    { id: "actions", header: "",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div style={{ display:"flex", gap:5 }}>
            <button title="Düzenle" onClick={() => openEdit(p)}
              style={{ background:"rgba(200,162,107,0.1)", border:"none", borderRadius:6, padding:"5px 8px", color:"#c8a26b", cursor:"pointer" }}>
              <Edit2 size={13}/>
            </button>
            <button title="Varyantlar" onClick={() => openVariants(p)}
              style={{ background:"rgba(96,165,250,0.1)", border:"none", borderRadius:6, padding:"5px 8px", color:"#60a5fa", cursor:"pointer", fontSize:11, fontWeight:600 }}>
              Varyant
            </button>
            <button title="Kopyala" onClick={() => duplicate(p)}
              style={{ background:"rgba(255,255,255,0.05)", border:"none", borderRadius:6, padding:"5px 8px", color:"#9b9ba4", cursor:"pointer" }}>
              <Copy size={13}/>
            </button>
            <button title="Arşivle" onClick={() => archive(p.id)}
              style={{ background:"rgba(255,255,255,0.05)", border:"none", borderRadius:6, padding:"5px 8px", color:"#9b9ba4", cursor:"pointer" }}>
              <Archive size={13}/>
            </button>
          </div>
        );
      }},
  ];

  const bulkActions: BulkAction[] = [
    { label:"Yayınla", onClick: (ids) => bulkStatus(ids, "active") },
    { label:"Taslağa Al", onClick: (ids) => bulkStatus(ids, "draft") },
    { label:"Sil", onClick: bulkDelete, danger: true },
  ];

  const inputStyle: React.CSSProperties = { background:"#0f0f12", border:"1px solid rgba(255,255,255,0.1)", borderRadius:7, color:"#f2f2f3", fontSize:13, padding:"8px 12px", width:"100%", boxSizing:"border-box" };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Package size={22} color="#c8a26b" />
          <span style={{ fontSize:22, fontWeight:700, color:"#f2f2f3" }}>Ürünler</span>
          <span style={{ fontSize:13, color:"#6b6b76", background:"rgba(255,255,255,0.05)", padding:"3px 10px", borderRadius:20 }}>{total}</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <input ref={fileRef} type="file" accept=".csv" style={{ display:"none" }} onChange={handleCSVImport} />
          <button onClick={() => fileRef.current?.click()} disabled={importing}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#9b9ba4", cursor:importing ? "not-allowed":"pointer", fontSize:13 }}>
            <Upload size={14}/>{importing ? "İçe Aktarılıyor…":"CSV İçe Aktar"}
          </button>
          <button onClick={openCreate}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, background:"#c8a26b", border:"none", color:"#000", cursor:"pointer", fontWeight:700, fontSize:13 }}>
            <Plus size={14}/> Ürün Ekle
          </button>
        </div>
      </div>

      {/* Filtreler */}
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {[{ label:"Tümü", value:"" }, { label:"Aktif", value:"active" }, { label:"Pasif", value:"inactive" }, { label:"Taslak", value:"draft" }].map(f => (
          <button key={f.value} onClick={() => { setStatusFilter(f.value); setPage(1); }}
            style={{ padding:"6px 14px", borderRadius:20, border: statusFilter===f.value ? "1px solid #c8a26b":"1px solid rgba(255,255,255,0.08)",
              background: statusFilter===f.value ? "rgba(200,162,107,0.12)":"transparent",
              color: statusFilter===f.value ? "#c8a26b":"#9b9ba4", cursor:"pointer", fontSize:13 }}>
            {f.label}
          </button>
        ))}
      </div>

      <DataTable
        data={products} columns={columns} loading={loading}
        total={total} page={page} pageSize={PAGE_SIZE}
        onPageChange={p => setPage(p)}
        onSearch={q => { setSearch(q); setPage(1); }}
        searchPlaceholder="Ürün adı, slug…"
        bulkActions={bulkActions}
        onExportCSV={exportCSV}
        emptyMessage="Ürün bulunamadı."
      />

      {/* Create / Edit Modal */}
      {(modal === "create" || modal === "edit") && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}
          onClick={() => setModal(null)}>
          <div style={{ background:"#1a1a1f", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:28, width:540, maxWidth:"94vw", maxHeight:"90vh", overflowY:"auto" as "auto" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h3 style={{ fontSize:17, fontWeight:700, color:"#f2f2f3", margin:0 }}>{modal==="edit" ? "Ürünü Düzenle":"Yeni Ürün"}</h3>
              <button onClick={() => setModal(null)} style={{ background:"transparent", border:"none", color:"#6b6b76", cursor:"pointer" }}><X size={18}/></button>
            </div>
            <div style={{ display:"grid", gap:14 }}>
              <div>
                <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:4 }}>Ürün Adı *</label>
                <input style={inputStyle} value={form.name}
                  onChange={e => { const v = e.target.value; setForm(f => ({ ...f, name:v, slug: v.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"") })); }}
                  placeholder="Tiramisu Protein Bar" />
              </div>
              <div>
                <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:4 }}>Slug</label>
                <input style={inputStyle} value={form.slug} onChange={e => setForm(f => ({...f, slug:e.target.value}))} placeholder="tiramisu-protein-bar" />
              </div>
              <div>
                <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:4 }}>Kısa Açıklama</label>
                <textarea style={{ ...inputStyle, minHeight:70, resize:"vertical" as "vertical" }} value={form.short_description}
                  onChange={e => setForm(f => ({...f, short_description:e.target.value}))} placeholder="Ürün kısa açıklaması…" />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:4 }}>Fiyat (₺) *</label>
                  <input type="number" step="0.01" style={inputStyle} value={form.price} onChange={e => setForm(f => ({...f, price:e.target.value}))} placeholder="39.90" />
                </div>
                <div>
                  <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:4 }}>İndirim Öncesi (₺)</label>
                  <input type="number" step="0.01" style={inputStyle} value={form.compare_at_price} onChange={e => setForm(f => ({...f, compare_at_price:e.target.value}))} placeholder="49.90" />
                </div>
              </div>
              <div>
                <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:4 }}>Durum</label>
                <select style={inputStyle} value={form.status} onChange={e => setForm(f => ({...f, status:e.target.value}))}>
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                  <option value="draft">Taslak</option>
                </select>
              </div>
              <div style={{ display:"flex", gap:20 }}>
                <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:"#9b9ba4" }}>
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({...f, is_featured:e.target.checked}))} style={{ accentColor:"#c8a26b" }} />
                  Öne Çıkan
                </label>
                <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:"#9b9ba4" }}>
                  <input type="checkbox" checked={form.is_bestseller} onChange={e => setForm(f => ({...f, is_bestseller:e.target.checked}))} style={{ accentColor:"#c8a26b" }} />
                  Çok Satan
                </label>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:24 }}>
              <button onClick={save} disabled={saving}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 24px", borderRadius:8, background:"#c8a26b", border:"none", color:"#000", cursor:saving ? "not-allowed":"pointer", fontWeight:700, fontSize:14, opacity:saving ? .7:1 }}>
                <Save size={15}/>{saving ? "Kaydediliyor…" : modal==="edit" ? "Güncelle":"Kaydet"}
              </button>
              <button onClick={() => setModal(null)}
                style={{ padding:"10px 18px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#9b9ba4", cursor:"pointer", fontSize:14 }}>
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Varyantlar Modal */}
      {modal === "variants" && selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}
          onClick={() => setModal(null)}>
          <div style={{ background:"#1a1a1f", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:28, width:720, maxWidth:"95vw", maxHeight:"90vh", overflowY:"auto" as "auto" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:"#f2f2f3", margin:0 }}>Varyant Yönetimi</h3>
              <button onClick={() => setModal(null)} style={{ background:"transparent", border:"none", color:"#6b6b76", cursor:"pointer" }}><X size={18}/></button>
            </div>
            <ProductVariants productId={selected.id} productName={selected.name} />
          </div>
        </div>
      )}
    </div>
  );
}
