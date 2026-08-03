"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Menu, Plus, Trash2, GripVertical, ChevronRight, Save } from "lucide-react";

type MenuItem = { id:string; menu_id:string; parent_id:string|null; label:string; url:string|null; sort_order:number; is_active:boolean; target:string };
type MenuDef = { id:string; name:string; location:string; is_active:boolean };

export default function MenulerPage() {
  const [menus, setMenus] = useState<MenuDef[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<string|null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState({ label:"", url:"", parent_id:"", target:"_self" });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const loadMenus = useCallback(async () => {
    const { data } = await supabase.from("menus").select("*").order("name");
    setMenus((data ?? []) as MenuDef[]);
    if (!selectedMenu && data && data.length > 0) setSelectedMenu(data[0].id);
  }, [supabase, selectedMenu]);

  const loadItems = useCallback(async () => {
    if (!selectedMenu) return;
    const { data } = await supabase.from("menu_items").select("*").eq("menu_id", selectedMenu).order("sort_order");
    setItems((data ?? []) as MenuItem[]);
  }, [supabase, selectedMenu]);

  useEffect(() => { loadMenus(); }, [loadMenus]);
  useEffect(() => { loadItems(); }, [loadItems]);

  async function addItem() {
    if (!itemForm.label || !selectedMenu) return;
    setSaving(true);
    await supabase.from("menu_items").insert({
      menu_id: selectedMenu,
      label: itemForm.label,
      url: itemForm.url || null,
      parent_id: itemForm.parent_id || null,
      target: itemForm.target,
      sort_order: items.length,
      is_active: true,
    });
    setItemForm({ label:"", url:"", parent_id:"", target:"_self" });
    setShowItemForm(false); setSaving(false); loadItems();
  }

  async function deleteItem(id: string) {
    await supabase.from("menu_items").delete().eq("id", id);
    loadItems();
  }

  async function toggleItem(id: string, current: boolean) {
    await supabase.from("menu_items").update({ is_active:!current }).eq("id", id);
    loadItems();
  }

  const topItems = items.filter(i => !i.parent_id);
  const inputStyle: React.CSSProperties = { background:"#151518", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, color:"#f2f2f3", fontSize:13, padding:"8px 12px" };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <Menu size={22} color="#c8a26b" />
        <span style={{ fontSize:22, fontWeight:700, color:"#f2f2f3" }}>Menü Yönetimi</span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:20 }}>
        {/* Sol: Menü listesi */}
        <div>
          {menus.map(m => (
            <button key={m.id} onClick={() => setSelectedMenu(m.id)}
              style={{ width:"100%", textAlign:"left", padding:"10px 14px", borderRadius:8,
                border: selectedMenu===m.id ? "1px solid #c8a26b":"1px solid rgba(255,255,255,0.08)",
                background: selectedMenu===m.id ? "rgba(200,162,107,0.1)":"#1a1a1f",
                color: selectedMenu===m.id ? "#c8a26b":"#f2f2f3", cursor:"pointer", marginBottom:8,
                display:"block" }}>
              <p style={{ margin:0, fontSize:13, fontWeight:600 }}>{m.name}</p>
              <p style={{ margin:0, fontSize:11, color:"#6b6b76" }}>{m.location}</p>
            </button>
          ))}
        </div>

        {/* Sağ: Menü öğeleri */}
        <div style={{ background:"#1a1a1f", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <span style={{ fontSize:15, fontWeight:600, color:"#f2f2f3" }}>Menü Öğeleri</span>
            <button onClick={() => setShowItemForm(s => !s)}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:6, background:"#c8a26b", border:"none", color:"#000", cursor:"pointer", fontWeight:700, fontSize:13 }}>
              <Plus size={14}/> Öğe Ekle
            </button>
          </div>

          {showItemForm && (
            <div style={{ background:"#151518", border:"1px solid rgba(200,162,107,0.2)", borderRadius:8, padding:16, marginBottom:16 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                <div>
                  <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:4 }}>Başlık *</label>
                  <input style={{ ...inputStyle, width:"100%", boxSizing:"border-box" as "border-box" }}
                    value={itemForm.label} onChange={e => setItemForm(f => ({...f, label:e.target.value}))} placeholder="Mağaza" />
                </div>
                <div>
                  <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:4 }}>URL</label>
                  <input style={{ ...inputStyle, width:"100%", boxSizing:"border-box" as "border-box" }}
                    value={itemForm.url} onChange={e => setItemForm(f => ({...f, url:e.target.value}))} placeholder="/magaza" />
                </div>
                <div>
                  <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:4 }}>Üst Öğe</label>
                  <select style={{ ...inputStyle, width:"100%", boxSizing:"border-box" as "border-box" }}
                    value={itemForm.parent_id} onChange={e => setItemForm(f => ({...f, parent_id:e.target.value}))}>
                    <option value="">— Üst Seviye —</option>
                    {topItems.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:4 }}>Hedef</label>
                  <select style={{ ...inputStyle, width:"100%", boxSizing:"border-box" as "border-box" }}
                    value={itemForm.target} onChange={e => setItemForm(f => ({...f, target:e.target.value}))}>
                    <option value="_self">Aynı sekme</option>
                    <option value="_blank">Yeni sekme</option>
                  </select>
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={addItem} disabled={saving}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 16px", borderRadius:6, background:"#c8a26b", border:"none", color:"#000", cursor:"pointer", fontWeight:700, fontSize:13 }}>
                  <Save size={14}/>{saving ? "…":"Kaydet"}
                </button>
                <button onClick={() => setShowItemForm(false)}
                  style={{ padding:"7px 14px", borderRadius:6, background:"transparent", border:"1px solid rgba(255,255,255,0.1)", color:"#9b9ba4", cursor:"pointer", fontSize:13 }}>
                  İptal
                </button>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <p style={{ color:"#6b6b76", textAlign:"center", padding:"30px 0", fontSize:13 }}>Öğe yok. Eklemek için "Öğe Ekle"ye tıklayın.</p>
          ) : topItems.map(item => {
            const children = items.filter(i => i.parent_id === item.id);
            return (
              <div key={item.id} style={{ marginBottom:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:8, padding:"10px 14px" }}>
                  <GripVertical size={14} color="#3a3a45" />
                  <span style={{ flex:1, fontSize:13, color: item.is_active ? "#f2f2f3":"#6b6b76", fontWeight:500 }}>
                    {item.label}
                    {item.url && <span style={{ fontSize:11, color:"#6b6b76", marginLeft:8 }}>{item.url}</span>}
                  </span>
                  {children.length > 0 && <ChevronRight size={14} color="#6b6b76" />}
                  <button onClick={() => toggleItem(item.id, item.is_active)}
                    style={{ fontSize:11, padding:"3px 8px", borderRadius:4, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color: item.is_active ? "#4ade80":"#6b6b76", cursor:"pointer" }}>
                    {item.is_active ? "Aktif":"Pasif"}
                  </button>
                  <button onClick={() => deleteItem(item.id)}
                    style={{ background:"rgba(248,113,113,0.1)", border:"none", borderRadius:5, padding:"4px 8px", color:"#f87171", cursor:"pointer" }}>
                    <Trash2 size={13}/>
                  </button>
                </div>
                {children.map(child => (
                  <div key={child.id} style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.04)", borderRadius:7, padding:"8px 14px", marginTop:4, marginLeft:28 }}>
                    <span style={{ flex:1, fontSize:12, color:"#9b9ba4" }}>
                      ↳ {child.label}
                      {child.url && <span style={{ fontSize:11, color:"#6b6b76", marginLeft:8 }}>{child.url}</span>}
                    </span>
                    <button onClick={() => deleteItem(child.id)}
                      style={{ background:"rgba(248,113,113,0.1)", border:"none", borderRadius:5, padding:"3px 7px", color:"#f87171", cursor:"pointer" }}>
                      <Trash2 size={12}/>
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
