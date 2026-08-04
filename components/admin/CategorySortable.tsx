"use client";
import { useState } from "react";
import { GripVertical, Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Category = { id: string; name: string; sort_order: number; slug: string };

interface Props { categories: Category[]; onSaved?: () => void; }

export function CategorySortable({ categories: initial, onSaved }: Props) {
  const [items, setItems] = useState<Category[]>([...initial].sort((a,b) => a.sort_order - b.sort_order));
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  function onDragStart(id: string) { setDragging(id); }
  function onDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    if (dragging && dragging !== id) setDragOver(id);
  }
  function onDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return; }
    const from = items.findIndex(i => i.id === dragging);
    const to = items.findIndex(i => i.id === targetId);
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next.map((item, idx) => ({ ...item, sort_order: idx })));
    setDragging(null); setDragOver(null); setSaved(false);
  }

  async function saveOrder() {
    setSaving(true);
    await Promise.all(items.map((item, idx) =>
      supabase.from("categories").update({ sort_order: idx }).eq("id", item.id)
    ));
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSaved?.();
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <p style={{ fontSize:13, color:"#6b6b76", margin:0 }}>Sıralamayı değiştirmek için sürükle-bırak yapın.</p>
        <button onClick={saveOrder} disabled={saving}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 16px", borderRadius:7, background:"#c8a26b", border:"none", color:"#000", cursor:saving ? "not-allowed":"pointer", fontWeight:700, fontSize:13, opacity:saving ? .7:1 }}>
          {saving ? <Loader2 size={13} style={{ animation:"spin 1s linear infinite" }}/> : <Save size={13}/>}
          {saved ? "Kaydedildi ✓" : saving ? "…" : "Sırayı Kaydet"}
        </button>
      </div>

      <div style={{ display:"flex", flexDirection:"column" as "column", gap:6 }}>
        {items.map((item, idx) => (
          <div key={item.id}
            draggable
            onDragStart={() => onDragStart(item.id)}
            onDragOver={e => onDragOver(e, item.id)}
            onDrop={e => onDrop(e, item.id)}
            onDragEnd={() => { setDragging(null); setDragOver(null); }}
            style={{
              display:"flex", alignItems:"center", gap:12,
              background: dragging===item.id ? "rgba(200,162,107,0.08)" : dragOver===item.id ? "rgba(200,162,107,0.12)" : "#1a1a1f",
              border: `1px solid ${dragOver===item.id ? "rgba(200,162,107,0.4)" : "rgba(255,255,255,0.07)"}`,
              borderRadius:9, padding:"11px 14px", cursor:"grab",
              transition:"all .15s", opacity: dragging===item.id ? .5 : 1,
              userSelect:"none" as "none",
            }}>
            <GripVertical size={16} color="#3a3a45" style={{ flexShrink:0 }} />
            <span style={{ fontSize:13, color:"#6b6b76", minWidth:24, fontFamily:"monospace" }}>{idx+1}</span>
            <span style={{ flex:1, fontSize:14, fontWeight:500, color:"#f2f2f3" }}>{item.name}</span>
            <span style={{ fontSize:11, color:"#6b6b76", fontFamily:"monospace" }}>{item.slug}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
