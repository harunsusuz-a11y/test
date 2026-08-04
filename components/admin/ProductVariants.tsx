"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Save, Edit2, X } from "lucide-react";

type Variant = {
  id: string; product_id: string; name: string; sku: string | null;
  price: number; compare_at_price: number | null;
  stock_quantity: number; is_active: boolean;
};

interface Props { productId: string; productName: string; }

const inputStyle: React.CSSProperties = {
  background:"#0f0f12", border:"1px solid rgba(255,255,255,0.1)", borderRadius:7,
  color:"#f2f2f3", fontSize:13, padding:"8px 12px", width:"100%", boxSizing:"border-box",
};

const EMPTY_FORM = { name:"", sku:"", price:"", compare_at_price:"", stock_quantity:"0", is_active: true };

export function ProductVariants({ productId, productName }: Props) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("product_variants")
      .select("*").eq("product_id", productId).order("created_at");
    setVariants((data ?? []) as Variant[]);
    setLoading(false);
  }, [supabase, productId]);

  useEffect(() => { load(); }, [load]);

  function startEdit(v: Variant) {
    setEditingId(v.id);
    setForm({ name:v.name, sku:v.sku??"", price:String(v.price), compare_at_price:String(v.compare_at_price??""), stock_quantity:String(v.stock_quantity), is_active:v.is_active });
    setShowForm(false);
  }

  function startNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  async function save() {
    if (!form.name || !form.price) return;
    setSaving(true);
    const payload = {
      product_id: productId,
      name: form.name,
      sku: form.sku || null,
      price: parseFloat(form.price),
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      is_active: form.is_active,
    };

    if (editingId) {
      await supabase.from("product_variants").update(payload).eq("id", editingId);
    } else {
      await supabase.from("product_variants").insert(payload);
    }

    setSaving(false); setEditingId(null); setShowForm(false); setForm(EMPTY_FORM); load();
  }

  async function del(id: string) {
    if (!confirm("Bu varyantı silmek istiyor musunuz?")) return;
    await supabase.from("product_variants").delete().eq("id", id);
    load();
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from("product_variants").update({ is_active:!current }).eq("id", id);
    load();
  }

  const formVisible = showForm || editingId !== null;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h3 style={{ fontSize:16, fontWeight:700, color:"#f2f2f3", margin:0 }}>Varyantlar</h3>
          <p style={{ fontSize:12, color:"#6b6b76", margin:"4px 0 0" }}>{productName}</p>
        </div>
        <button onClick={startNew}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, background:"#c8a26b", border:"none", color:"#000", cursor:"pointer", fontWeight:700, fontSize:13 }}>
          <Plus size={14} /> Varyant Ekle
        </button>
      </div>

      {formVisible && (
        <div style={{ background:"#151518", border:"1px solid rgba(200,162,107,0.25)", borderRadius:10, padding:20, marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <span style={{ fontSize:14, fontWeight:600, color:"#f2f2f3" }}>{editingId ? "Varyantı Düzenle" : "Yeni Varyant"}</span>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{ background:"transparent", border:"none", color:"#6b6b76", cursor:"pointer" }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:12 }}>
            <div>
              <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:4 }}>Varyant Adı *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} placeholder="Örn: Tiramisu 45g" />
            </div>
            <div>
              <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:4 }}>SKU</label>
              <input style={inputStyle} value={form.sku} onChange={e => setForm(f => ({...f, sku:e.target.value}))} placeholder="VA-TRM-45" />
            </div>
            <div>
              <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:4 }}>Stok</label>
              <input type="number" style={inputStyle} value={form.stock_quantity} onChange={e => setForm(f => ({...f, stock_quantity:e.target.value}))} min="0" />
            </div>
            <div>
              <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:4 }}>Fiyat (₺) *</label>
              <input type="number" step="0.01" style={inputStyle} value={form.price} onChange={e => setForm(f => ({...f, price:e.target.value}))} placeholder="39.90" />
            </div>
            <div>
              <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:4 }}>İndirim Öncesi Fiyat (₺)</label>
              <input type="number" step="0.01" style={inputStyle} value={form.compare_at_price} onChange={e => setForm(f => ({...f, compare_at_price:e.target.value}))} placeholder="49.90" />
            </div>
            <div style={{ display:"flex", alignItems:"flex-end", paddingBottom:2 }}>
              <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:"#9b9ba4" }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active:e.target.checked}))} style={{ accentColor:"#c8a26b" }} />
                Aktif
              </label>
            </div>
          </div>
          <button onClick={save} disabled={saving}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 20px", borderRadius:7, background:"#c8a26b", border:"none", color:"#000", cursor:saving ? "not-allowed":"pointer", fontWeight:700, fontSize:13, opacity:saving ? .7:1 }}>
            <Save size={14} />{saving ? "…" : editingId ? "Güncelle" : "Ekle"}
          </button>
        </div>
      )}

      {loading ? (
        <p style={{ color:"#6b6b76", fontSize:13 }}>Yükleniyor…</p>
      ) : variants.length === 0 ? (
        <div style={{ textAlign:"center", padding:"32px 0", color:"#6b6b76", fontSize:13 }}>
          Henüz varyant yok. Ürüne varyant eklemek için "Varyant Ekle"ye tıklayın.
        </div>
      ) : (
        <div style={{ display:"grid", gap:8 }}>
          {/* Header */}
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 80px 100px", gap:12, padding:"8px 14px", fontSize:12, color:"#6b6b76", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <span>Varyant</span><span>Fiyat</span><span>İndirim Fiyatı</span><span>Stok</span><span>Durum</span><span>İşlem</span>
          </div>
          {variants.map(v => (
            <div key={v.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 80px 100px", gap:12, padding:"12px 14px", background: editingId===v.id ? "rgba(200,162,107,0.04)" : "#1a1a1f", border:`1px solid ${editingId===v.id ? "rgba(200,162,107,0.2)":"rgba(255,255,255,0.06)"}`, borderRadius:8, alignItems:"center" }}>
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:"#f2f2f3" }}>{v.name}</div>
                {v.sku && <div style={{ fontSize:11, color:"#6b6b76", fontFamily:"monospace" }}>{v.sku}</div>}
              </div>
              <span style={{ fontSize:13, fontWeight:600, color:"#f2f2f3" }}>₺{Number(v.price).toFixed(2)}</span>
              <span style={{ fontSize:13, color:"#6b6b76", textDecoration:"line-through" }}>
                {v.compare_at_price ? `₺${Number(v.compare_at_price).toFixed(2)}` : "-"}
              </span>
              <span style={{ fontSize:13, fontWeight:600, color: v.stock_quantity <= 5 ? "#f87171" : v.stock_quantity <= 20 ? "#f59e0b" : "#4ade80" }}>
                {v.stock_quantity}
              </span>
              <button onClick={() => toggleActive(v.id, v.is_active)}
                style={{ fontSize:11, padding:"3px 10px", borderRadius:20, border:`1px solid ${v.is_active ? "#4ade80":"#6b6b76"}`, background: v.is_active ? "rgba(74,222,128,0.1)":"transparent", color: v.is_active ? "#4ade80":"#6b6b76", cursor:"pointer" }}>
                {v.is_active ? "Aktif":"Pasif"}
              </button>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={() => startEdit(v)}
                  style={{ background:"rgba(200,162,107,0.1)", border:"none", borderRadius:6, padding:"5px 9px", color:"#c8a26b", cursor:"pointer" }}>
                  <Edit2 size={13} />
                </button>
                <button onClick={() => del(v.id)}
                  style={{ background:"rgba(248,113,113,0.1)", border:"none", borderRadius:6, padding:"5px 9px", color:"#f87171", cursor:"pointer" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          {/* Toplam stok */}
          <div style={{ display:"flex", justifyContent:"flex-end", padding:"8px 14px", fontSize:12, color:"#6b6b76" }}>
            Toplam stok: <strong style={{ color:"#f2f2f3", marginLeft:6 }}>{variants.reduce((s,v) => s + v.stock_quantity, 0)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
