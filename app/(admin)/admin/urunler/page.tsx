"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable, type BulkAction } from "@/components/admin/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Package, Plus, Edit2, Archive, Copy, X, Save,
  Upload, ChevronDown, ChevronUp, Eye, EyeOff,
  Star, AlertTriangle, BarChart2,
} from "lucide-react";
import { useToast } from "@/components/admin/ui/Toast";

type Product = {
  id: string; name: string; slug: string; status: string;
  price: number; compare_at_price: number | null;
  main_image_url: string | null; short_description: string | null;
  description: string | null; is_featured: boolean; is_bestseller: boolean;
  protein_percent: number | null; hazelnut_percent: number | null;
  flavor: string | null; weight: number | null; sort_order: number | null;
  highlights: string[]; ingredients: string[]; usage_tips: string[];
  faq: { question: string; answer: string }[];
  nutrition_per_100g: { label: string; value: string }[];
  attributes: { label: string; value: string }[];
  category_id: string | null; meta_title: string | null;
  meta_description: string | null; category?: { name: string } | null;
  inventory?: { quantity: number; critical_level: number }[] | null;
};

type Category = { id: string; name: string; slug: string };

const EMPTY: Partial<Product> = {
  name: "", slug: "", status: "active", price: 0, compare_at_price: null,
  main_image_url: null, short_description: null, description: null,
  is_featured: false, is_bestseller: false, protein_percent: null,
  hazelnut_percent: null, flavor: null, weight: null, sort_order: null,
  highlights: [], ingredients: [], usage_tips: [],
  faq: [], nutrition_per_100g: [], attributes: [],
  category_id: null, meta_title: null, meta_description: null,
};

export default function UrunlerPage() {
  const supabase = createClient();
  const _toast = useToast();
  const showToast = (msg: string, type: "success"|"error") => type === "success" ? _toast.success(msg) : _toast.error(msg);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Product>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"temel"|"icerik"|"seo"|"stok">("temel");

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from("products")
        .select("*,category:categories(name),inventory(quantity,critical_level)")
        .order("sort_order", { ascending: true }),
      supabase.from("categories").select("id,name,slug").order("name"),
    ]);
    setProducts((prods ?? []) as Product[]);
    setCategories((cats ?? []) as Category[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() { setEditing({ ...EMPTY }); setActiveTab("temel"); setDrawerOpen(true); }
  function openEdit(p: Product) { setEditing({ ...p }); setActiveTab("temel"); setDrawerOpen(true); }

  async function save() {
    if (!editing.name || !editing.slug) { showToast("Ad ve slug zorunlu", "error"); return; }
    setSaving(true);
    const payload = { ...editing };
    delete (payload as { category?: unknown }).category;
    delete (payload as { inventory?: unknown }).inventory;

    const { error } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);

    if (error) { showToast(error.message, "error"); }
    else { showToast(editing.id ? "Güncellendi" : "Oluşturuldu", "success"); setDrawerOpen(false); load(); }
    setSaving(false);
  }

  async function toggleStatus(p: Product) {
    const status = p.status === "active" ? "archived" : "active";
    await supabase.from("products").update({ status }).eq("id", p.id);
    showToast(status === "active" ? "Aktif edildi" : "Arşivlendi", "success");
    load();
  }

  async function duplicate(p: Product) {
    const { id, category, inventory, ...rest } = p as Product & { category?: unknown; inventory?: unknown };
    const newSlug = `${rest.slug}-kopya-${Date.now().toString(36)}`;
    await supabase.from("products").insert({ ...rest, name: `${rest.name} (Kopya)`, slug: newSlug, status: "draft" });
    showToast("Kopyalandı", "success"); load();
  }

  async function bulkArchive(ids: string[]) {
    await supabase.from("products").update({ status: "archived" }).in("id", ids);
    showToast(`${ids.length} ürün arşivlendi`, "success"); load();
  }

  const fmt = (n: number) => `₺${n.toLocaleString("tr-TR")}`;

  const columns: ColumnDef<Product>[] = [
    {
      id: "urun", header: "Ürün",
      cell: ({ row: { original: p } }) => (
        <div className="flex items-center gap-3">
          {p.main_image_url
            ? <img src={p.main_image_url} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
            : <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-xl">🌰</div>}
          <div>
            <p className="font-medium text-stone-800">{p.name}</p>
            <p className="text-xs text-stone-400">{p.slug}</p>
          </div>
        </div>
      ),
    },
    {
      id: "fiyat", header: "Fiyat",
      cell: ({ row: { original: p } }) => (
        <div>
          <p className="font-semibold text-stone-800">{fmt(p.price)}</p>
          {p.compare_at_price && <p className="text-xs text-stone-400 line-through">{fmt(p.compare_at_price)}</p>}
        </div>
      ),
    },
    {
      id: "stok", header: "Stok",
      cell: ({ row: { original: p } }) => {
        const inv = (p.inventory ?? [])[0];
        if (!inv) return <span className="text-xs text-stone-400">—</span>;
        const isLow = inv.quantity <= inv.critical_level;
        return (
          <div className="flex items-center gap-1.5">
            {isLow && <AlertTriangle size={12} className="text-orange-500" />}
            <span className={`font-medium ${isLow ? "text-orange-600" : "text-stone-700"}`}>{inv.quantity}</span>
            <span className="text-xs text-stone-400">adet</span>
          </div>
        );
      },
    },
    {
      id: "durum", header: "Durum",
      cell: ({ row: { original: p } }) => {
        const map: Record<string, { label: string; cls: string }> = {
          active: { label: "Aktif", cls: "bg-green-100 text-green-700" },
          draft: { label: "Taslak", cls: "bg-yellow-100 text-yellow-700" },
          archived: { label: "Arşiv", cls: "bg-stone-100 text-stone-500" },
        };
        const s = map[p.status] ?? { label: p.status, cls: "bg-stone-100 text-stone-500" };
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>;
      },
    },
    {
      id: "flags", header: "",
      cell: ({ row: { original: p } }) => (
        <div className="flex gap-1">
          {p.is_featured && <Star size={12} className="text-amber-400" />}
          {p.is_bestseller && <BarChart2 size={12} className="text-blue-400" />}
        </div>
      ),
    },
    {
      id: "islemler", header: "",
      cell: ({ row: { original: p } }) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 hover:bg-stone-100" title="Düzenle">
            <Edit2 size={14} className="text-stone-500" />
          </button>
          <button onClick={() => duplicate(p)} className="rounded-lg p-1.5 hover:bg-stone-100" title="Kopyala">
            <Copy size={14} className="text-stone-500" />
          </button>
          <button onClick={() => toggleStatus(p)} className="rounded-lg p-1.5 hover:bg-stone-100"
            title={p.status === "active" ? "Arşivle" : "Aktif et"}>
            {p.status === "active"
              ? <EyeOff size={14} className="text-stone-500" />
              : <Eye size={14} className="text-stone-500" />}
          </button>
        </div>
      ),
    },
  ];

  const bulkActions: BulkAction[] = [
    { label: "Arşivle", onClick: (ids: string[]) => bulkArchive(ids) },
  ];

  // Tag input helper
  function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
    const [input, setInput] = useState("");
    return (
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2">
        {value.map((tag, i) => (
          <span key={i} className="flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-700">
            {tag}
            <button onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-stone-400 hover:text-stone-600">×</button>
          </span>
        ))}
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              const t = input.trim();
              if (t) { onChange([...value, t]); setInput(""); }
            }
          }}
          className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-stone-300"
        />
      </div>
    );
  }

  return (
    <>
      
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Ürünler</h1>
            <p className="text-sm text-stone-500">{products.length} ürün</p>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-2 rounded-xl bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">
            <Plus size={16} /> Yeni Ürün
          </button>
        </div>

        <DataTable columns={columns} data={products} loading={loading} bulkActions={bulkActions}
          searchPlaceholder="Ürün ara..." emptyMessage="Ürün bulunamadı" />
      </div>

      {/* Ürün Düzenleme Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="font-semibold text-stone-800">
                {editing.id ? "Ürün Düzenle" : "Yeni Ürün"}
              </h2>
              <button onClick={() => setDrawerOpen(false)} className="rounded-lg p-1.5 hover:bg-stone-100">
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b px-6 text-sm">
              {(["temel","icerik","seo","stok"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`-mb-px border-b-2 px-4 py-3 font-medium capitalize transition ${
                    activeTab === tab ? "border-stone-800 text-stone-800" : "border-transparent text-stone-400 hover:text-stone-600"
                  }`}>
                  {tab === "temel" ? "Temel" : tab === "icerik" ? "İçerik" : tab === "seo" ? "SEO" : "Stok"}
                </button>
              ))}
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {activeTab === "temel" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-stone-500">Ürün Adı *</label>
                      <input value={editing.name ?? ""} onChange={(e) => {
                        const name = e.target.value;
                        const slug = editing.id ? editing.slug : name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                        setEditing((p) => ({ ...p, name, slug }));
                      }} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-stone-500">Slug *</label>
                      <input value={editing.slug ?? ""} onChange={(e) => setEditing((p) => ({ ...p, slug: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400 font-mono" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-stone-500">Durum</label>
                      <select value={editing.status ?? "active"} onChange={(e) => setEditing((p) => ({ ...p, status: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none">
                        <option value="active">Aktif</option>
                        <option value="draft">Taslak</option>
                        <option value="archived">Arşiv</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-stone-500">Fiyat (₺) *</label>
                      <input type="number" value={editing.price ?? 0} onChange={(e) => setEditing((p) => ({ ...p, price: +e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-stone-500">Karşılaştırma Fiyatı (₺)</label>
                      <input type="number" value={editing.compare_at_price ?? ""} onChange={(e) => setEditing((p) => ({ ...p, compare_at_price: e.target.value ? +e.target.value : null }))}
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-stone-500">Kategori</label>
                      <select value={editing.category_id ?? ""} onChange={(e) => setEditing((p) => ({ ...p, category_id: e.target.value || null }))}
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none">
                        <option value="">— Seç —</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-stone-500">Ağırlık (g)</label>
                      <input type="number" value={editing.weight ?? ""} onChange={(e) => setEditing((p) => ({ ...p, weight: e.target.value ? +e.target.value : null }))}
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-stone-500">Protein %</label>
                      <input type="number" value={editing.protein_percent ?? ""} onChange={(e) => setEditing((p) => ({ ...p, protein_percent: e.target.value ? +e.target.value : null }))}
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-stone-500">Fındık %</label>
                      <input type="number" value={editing.hazelnut_percent ?? ""} onChange={(e) => setEditing((p) => ({ ...p, hazelnut_percent: e.target.value ? +e.target.value : null }))}
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-stone-500">Aroma</label>
                      <input value={editing.flavor ?? ""} onChange={(e) => setEditing((p) => ({ ...p, flavor: e.target.value || null }))}
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-stone-500">Görsel URL</label>
                      <input value={editing.main_image_url ?? ""} onChange={(e) => setEditing((p) => ({ ...p, main_image_url: e.target.value || null }))}
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none font-mono text-xs" />
                    </div>
                    <div className="col-span-2 flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={editing.is_featured ?? false}
                          onChange={(e) => setEditing((p) => ({ ...p, is_featured: e.target.checked }))}
                          className="rounded" />
                        <span className="text-sm text-stone-700">Öne Çıkan</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={editing.is_bestseller ?? false}
                          onChange={(e) => setEditing((p) => ({ ...p, is_bestseller: e.target.checked }))}
                          className="rounded" />
                        <span className="text-sm text-stone-700">Çok Satan</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-500">Kısa Açıklama</label>
                    <textarea value={editing.short_description ?? ""} rows={2}
                      onChange={(e) => setEditing((p) => ({ ...p, short_description: e.target.value || null }))}
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-500">Açıklama</label>
                    <textarea value={editing.description ?? ""} rows={4}
                      onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value || null }))}
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none resize-none" />
                  </div>
                </>
              )}

              {activeTab === "icerik" && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-500">Öne Çıkan Noktalar <span className="text-stone-300">(Enter ile ekle)</span></label>
                    <TagInput value={editing.highlights ?? []} onChange={(v) => setEditing((p) => ({ ...p, highlights: v }))} placeholder="Nokta ekle..." />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-500">İçerikler</label>
                    <TagInput value={editing.ingredients ?? []} onChange={(v) => setEditing((p) => ({ ...p, ingredients: v }))} placeholder="İçerik ekle..." />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-500">Kullanım İpuçları</label>
                    <TagInput value={editing.usage_tips ?? []} onChange={(v) => setEditing((p) => ({ ...p, usage_tips: v }))} placeholder="İpucu ekle..." />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-500">SSS (JSON)</label>
                    <textarea
                      value={JSON.stringify(editing.faq ?? [], null, 2)} rows={6}
                      onChange={(e) => { try { setEditing((p) => ({ ...p, faq: JSON.parse(e.target.value) })); } catch {} }}
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 font-mono text-xs outline-none resize-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-500">Besin Değerleri (JSON)</label>
                    <textarea
                      value={JSON.stringify(editing.nutrition_per_100g ?? [], null, 2)} rows={5}
                      onChange={(e) => { try { setEditing((p) => ({ ...p, nutrition_per_100g: JSON.parse(e.target.value) })); } catch {} }}
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 font-mono text-xs outline-none resize-none" />
                  </div>
                </>
              )}

              {activeTab === "seo" && (
                <>
                  <div>
                    <label className="text-xs font-medium text-stone-500">Meta Başlık</label>
                    <input value={editing.meta_title ?? ""} onChange={(e) => setEditing((p) => ({ ...p, meta_title: e.target.value || null }))}
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none" />
                    <p className="mt-1 text-xs text-stone-400">{(editing.meta_title ?? "").length}/60</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-500">Meta Açıklama</label>
                    <textarea value={editing.meta_description ?? ""} rows={3}
                      onChange={(e) => setEditing((p) => ({ ...p, meta_description: e.target.value || null }))}
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none resize-none" />
                    <p className="mt-1 text-xs text-stone-400">{(editing.meta_description ?? "").length}/160</p>
                  </div>
                  {/* SEO önizleme */}
                  <div className="rounded-xl bg-stone-50 p-4">
                    <p className="text-xs font-medium text-stone-400 mb-2">Google Önizleme</p>
                    <p className="text-blue-600 text-sm font-medium truncate">{editing.meta_title || editing.name || "Ürün Başlığı"}</p>
                    <p className="text-green-700 text-xs">ventiate.com › urun › {editing.slug}</p>
                    <p className="text-stone-500 text-xs mt-1 line-clamp-2">{editing.meta_description || editing.short_description || "Ürün açıklaması burada görünür..."}</p>
                  </div>
                </>
              )}

              {activeTab === "stok" && (
                <div className="rounded-xl bg-stone-50 p-4 text-sm text-stone-600">
                  <p className="font-medium text-stone-700 mb-2">Stok Yönetimi</p>
                  <p>Stok hareketleri Envanter sayfasından yönetilir.</p>
                  {editing.id && (
                    <a href={`/admin/envanter?product=${editing.id}`}
                      className="mt-3 inline-flex items-center gap-1 text-stone-800 underline underline-offset-2 text-sm">
                      Envanter sayfasına git →
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
              <button onClick={() => setDrawerOpen(false)} className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50">
                İptal
              </button>
              <button onClick={save} disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-stone-800 px-5 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50">
                <Save size={14} /> {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
