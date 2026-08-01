"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Campaign {
  id: string; name: string; description: string | null; type: string;
  value: number; min_cart: number; max_discount: number | null;
  usage_limit: number | null; used_count: number;
  starts_at: string | null; ends_at: string | null;
  is_active: boolean; priority: number;
}

const EMPTY = { name:"", description:"", type:"percent", value:10, min_cart:0, max_discount:"", usage_limit:"", starts_at:"", ends_at:"", is_active:true, priority:0 };

export default function AdminKampanyalar() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(EMPTY);
  const [editId, setEditId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("campaigns").select("*").order("priority", { ascending: false });
    setCampaigns((data as Campaign[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing.name) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      name: editing.name, description: editing.description || null,
      type: editing.type, value: Number(editing.value),
      min_cart: Number(editing.min_cart),
      max_discount: editing.max_discount ? Number(editing.max_discount) : null,
      usage_limit: editing.usage_limit ? Number(editing.usage_limit) : null,
      starts_at: editing.starts_at || null, ends_at: editing.ends_at || null,
      is_active: editing.is_active, priority: Number(editing.priority),
      created_by: user?.id,
    };
    if (editId) await supabase.from("campaigns").update(payload).eq("id", editId);
    else await supabase.from("campaigns").insert(payload);
    setSaving(false); setOpen(false); load();
  }

  async function toggleActive(id: string, val: boolean) {
    await supabase.from("campaigns").update({ is_active: val }).eq("id", id);
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, is_active: val } : c));
  }

  async function remove(id: string) {
    if (!confirm("Kampanya silinsin mi?")) return;
    await supabase.from("campaigns").delete().eq("id", id);
    load();
  }

  const TYPE_LABELS: Record<string, string> = { percent:"Yüzde", fixed:"Sabit", free_shipping:"Ücretsiz Kargo", buy_x_get_y:"Al X Öde Y" };

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">Kampanyalar</div><div className="adm-page-sub">{campaigns.length} kampanya · {campaigns.filter(c=>c.is_active).length} aktif</div></div>
        <button className="adm-btn adm-btn--primary" onClick={() => { setEditing(EMPTY); setEditId(null); setOpen(true); }}>+ Yeni Kampanya</button>
      </div>

      <div className="adm-card">
        {loading ? <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div> : (
          <table className="adm-table">
            <thead><tr><th>Ad</th><th>Tip</th><th>İndirim</th><th>Min. Sepet</th><th>Kullanım</th><th>Bitiş</th><th>Öncelik</th><th>Durum</th><th /></tr></thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id}>
                  <td><div className="adm-td--strong">{c.name}</div>{c.description && <div style={{ fontSize: 10, color: "var(--adm-text-4)" }}>{c.description}</div>}</td>
                  <td><span className="adm-badge adm-badge--accent">{TYPE_LABELS[c.type]||c.type}</span></td>
                  <td className="adm-mono adm-font-500">{c.type==="percent" ? `%${c.value}` : `₺${c.value}`}</td>
                  <td className="adm-mono adm-text-muted">{c.min_cart > 0 ? `₺${c.min_cart}` : "—"}</td>
                  <td className="adm-mono">
                    {c.usage_limit ? `${c.used_count}/${c.usage_limit}` : c.used_count}
                    {c.usage_limit && (
                      <div className="adm-progress" style={{ marginTop: 3 }}>
                        <div className="adm-progress-bar" style={{ width: `${Math.min(100,(c.used_count/c.usage_limit)*100)}%` }} />
                      </div>
                    )}
                  </td>
                  <td className="adm-text-muted">{c.ends_at ? new Date(c.ends_at).toLocaleDateString("tr-TR") : "—"}</td>
                  <td className="adm-mono">{c.priority}</td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div className={`adm-toggle${c.is_active?" on":""}`} onClick={() => toggleActive(c.id, !c.is_active)} />
                    </div>
                  </td>
                  <td>
                    <div style={{ display:"flex", gap:4, justifyContent:"flex-end" }}>
                      <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => { setEditing({ name:c.name, description:c.description||"", type:c.type, value:c.value, min_cart:c.min_cart, max_discount:c.max_discount?.toString()||"", usage_limit:c.usage_limit?.toString()||"", starts_at:c.starts_at?.slice(0,10)||"", ends_at:c.ends_at?.slice(0,10)||"", is_active:c.is_active, priority:c.priority }); setEditId(c.id); setOpen(true); }}>Düzenle</button>
                      <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => remove(c.id)}>Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && <tr><td colSpan={9}><div className="adm-empty"><div className="adm-empty__title">Kampanya yok</div></div></td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="adm-overlay" onClick={() => setOpen(false)}>
          <div className="adm-modal adm-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">{editId ? "Kampanya Düzenle" : "Yeni Kampanya"}</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field"><label className="adm-label-text">Ad</label><input className="adm-input" value={editing.name} onChange={e => setEditing({...editing, name:e.target.value})} /></div>
              <div className="adm-field"><label className="adm-label-text">Açıklama</label><input className="adm-input" value={editing.description} onChange={e => setEditing({...editing, description:e.target.value})} /></div>
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">Tip</label>
                  <select className="adm-select" value={editing.type} onChange={e => setEditing({...editing, type:e.target.value})}>
                    <option value="percent">Yüzde İndirim</option>
                    <option value="fixed">Sabit İndirim</option>
                    <option value="free_shipping">Ücretsiz Kargo</option>
                    <option value="buy_x_get_y">Al X Öde Y</option>
                  </select>
                </div>
                <div className="adm-field"><label className="adm-label-text">Değer ({editing.type==="percent"?"%":"₺"})</label><input className="adm-input" type="number" value={editing.value} onChange={e => setEditing({...editing, value:Number(e.target.value)})} /></div>
                <div className="adm-field"><label className="adm-label-text">Öncelik</label><input className="adm-input" type="number" value={editing.priority} onChange={e => setEditing({...editing, priority:Number(e.target.value)})} /></div>
              </div>
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">Min. Sepet (₺)</label><input className="adm-input" type="number" value={editing.min_cart} onChange={e => setEditing({...editing, min_cart:Number(e.target.value)})} /></div>
                <div className="adm-field"><label className="adm-label-text">Max. İndirim (₺)</label><input className="adm-input" type="number" value={editing.max_discount} onChange={e => setEditing({...editing, max_discount:e.target.value})} /></div>
                <div className="adm-field"><label className="adm-label-text">Kullanım Limiti</label><input className="adm-input" type="number" value={editing.usage_limit} onChange={e => setEditing({...editing, usage_limit:e.target.value})} /></div>
              </div>
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">Başlangıç</label><input className="adm-input" type="date" value={editing.starts_at} onChange={e => setEditing({...editing, starts_at:e.target.value})} /></div>
                <div className="adm-field"><label className="adm-label-text">Bitiş</label><input className="adm-input" type="date" value={editing.ends_at} onChange={e => setEditing({...editing, ends_at:e.target.value})} /></div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div className={`adm-toggle${editing.is_active?" on":""}`} onClick={() => setEditing({...editing, is_active:!editing.is_active})} />
                <span style={{ fontSize:12, color:"var(--adm-text-2)" }}>Aktif</span>
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
