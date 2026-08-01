"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  id: string; email: string; first_name: string | null; last_name: string | null;
  user_type: string; status: string; phone: string | null;
  last_login_at: string | null; created_at: string;
}
interface Role { id: string; name: string; label: string; }

const EMPTY = { email:"", first_name:"", last_name:"", user_type:"admin", status:"active", phone:"" };

export default function AdminKullanicilar() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(EMPTY);
  const [editId, setEditId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: u }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").in("user_type",["admin","super_admin"]).order("created_at", { ascending: false }),
      supabase.from("roles").select("*").order("name"),
    ]);
    setUsers((u as Profile[]) || []);
    setRoles((r as Role[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editId) return;
    setSaving(true);
    await supabase.from("profiles").update({
      first_name: editing.first_name || null, last_name: editing.last_name || null,
      user_type: editing.user_type, status: editing.status, phone: editing.phone || null,
    }).eq("id", editId);
    setSaving(false); setOpen(false); load();
  }

  async function toggleStatus(id: string, status: string) {
    const next = status === "active" ? "inactive" : "active";
    await supabase.from("profiles").update({ status: next }).eq("id", id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: next } : u));
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || u.email.toLowerCase().includes(q) ||
      (`${u.first_name||""} ${u.last_name||""}`).toLowerCase().includes(q);
  });

  const TYPE_BADGE: Record<string,string> = { super_admin:"adm-badge--accent", admin:"adm-badge--blue" };

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">Kullanıcılar & Roller</div><div className="adm-page-sub">{users.length} admin kullanıcı</div></div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
        {/* Kullanıcılar */}
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
            <div className="adm-search" style={{ flex:1, maxWidth:300 }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/></svg>
              <input className="adm-input" placeholder="Kullanıcı ara…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="adm-card">
            {loading ? <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div> : (
              <table className="adm-table">
                <thead><tr><th>Kullanıcı</th><th>Tip</th><th>Durum</th><th>Son Giriş</th><th /></tr></thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:28, height:28, borderRadius:"50%", background:"var(--adm-accent-dim)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"var(--adm-accent)", flexShrink:0 }}>
                            {(u.first_name || u.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize:12, fontWeight:500, color:"var(--adm-text)" }}>{u.first_name ? `${u.first_name} ${u.last_name||""}` : u.email}</div>
                            <div style={{ fontSize:10, color:"var(--adm-text-4)" }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`adm-badge ${TYPE_BADGE[u.user_type]||"adm-badge--muted"}`}>{u.user_type}</span></td>
                      <td>
                        <div className={`adm-toggle${u.status==="active"?" on":""}`} onClick={() => toggleStatus(u.id, u.status)} />
                      </td>
                      <td style={{ fontSize:11, color:"var(--adm-text-4)" }}>
                        {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString("tr-TR") : "—"}
                      </td>
                      <td>
                        <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => {
                          setEditing({ email:u.email, first_name:u.first_name||"", last_name:u.last_name||"", user_type:u.user_type, status:u.status, phone:u.phone||"" });
                          setEditId(u.id); setOpen(true);
                        }}>Düzenle</button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length===0 && <tr><td colSpan={5}><div className="adm-empty"><div className="adm-empty__title">Kullanıcı yok</div></div></td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Roller */}
        <div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"var(--adm-text)" }}>Roller</div>
          </div>
          <div className="adm-card">
            <table className="adm-table">
              <thead><tr><th>Rol</th><th>Tanım</th><th>Sistem</th></tr></thead>
              <tbody>
                {roles.map(r => (
                  <tr key={r.id}>
                    <td className="adm-td--strong">{r.label}</td>
                    <td className="adm-mono adm-text-muted" style={{ fontSize:10 }}>{r.name}</td>
                    <td><span className={`adm-badge ${r.name==="super_admin"?"adm-badge--accent":"adm-badge--muted"}`}>sistem</span></td>
                  </tr>
                ))}
                {roles.length===0 && <tr><td colSpan={3}><div className="adm-empty" style={{ padding:20 }}><div className="adm-empty__title">Rol bulunamadı</div></div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {open && editId && (
        <div className="adm-overlay" onClick={() => setOpen(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">Kullanıcı Düzenle</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field"><label className="adm-label-text">E-posta</label><input className="adm-input" value={editing.email} disabled style={{ opacity:0.5 }} /></div>
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">Ad</label><input className="adm-input" value={editing.first_name} onChange={e => setEditing({...editing, first_name:e.target.value})} /></div>
                <div className="adm-field"><label className="adm-label-text">Soyad</label><input className="adm-input" value={editing.last_name} onChange={e => setEditing({...editing, last_name:e.target.value})} /></div>
              </div>
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">Tip</label>
                  <select className="adm-select" value={editing.user_type} onChange={e => setEditing({...editing, user_type:e.target.value})}>
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="adm-field"><label className="adm-label-text">Durum</label>
                  <select className="adm-select" value={editing.status} onChange={e => setEditing({...editing, status:e.target.value})}>
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                    <option value="banned">Engelli</option>
                  </select>
                </div>
              </div>
              <div className="adm-field"><label className="adm-label-text">Telefon</label><input className="adm-input" value={editing.phone} onChange={e => setEditing({...editing, phone:e.target.value})} /></div>
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
