"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, MessageSquare, Bell, Edit2, Save, X } from "lucide-react";

type Template = { id:string; name:string; subject?:string; body?:string; body_html?:string; is_active:boolean; variables?:string[] };
type Tab = "notification"|"email"|"sms";

export default function SablonlarPage() {
  const [tab, setTab] = useState<Tab>("email");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Template>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const TABLE_MAP: Record<Tab, string> = {
    email: "email_templates",
    sms: "sms_templates",
    notification: "notification_templates",
  };

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from(TABLE_MAP[tab]).select("*").order("name");
    setTemplates((data ?? []) as Template[]);
    setLoading(false);
  }, [supabase, tab]);

  useEffect(() => { load(); }, [load]);

  function startEdit(t: Template) {
    setEditing(t.id);
    setEditData({ name: t.name, subject: t.subject, body: t.body, body_html: t.body_html, is_active: t.is_active });
  }

  async function save(id: string) {
    setSaving(true);
    await supabase.from(TABLE_MAP[tab]).update({ ...editData, updated_at: new Date().toISOString() }).eq("id", id);
    setEditing(null); setSaving(false); load();
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id:"email", label:"E-posta Şablonları", icon:<Mail size={14}/> },
    { id:"sms", label:"SMS Şablonları", icon:<MessageSquare size={14}/> },
    { id:"notification", label:"Bildirim Şablonları", icon:<Bell size={14}/> },
  ];

  const inputStyle: React.CSSProperties = { width:"100%", background:"var(--adm-surface)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, color:"var(--adm-text)", fontSize:13, padding:"8px 12px", boxSizing:"border-box" };
  const cardStyle: React.CSSProperties = { background:"var(--adm-surface)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:20, marginBottom:12 };

  return (
    <div style={{ padding:24 }}>
      <div style={{ fontSize:22, fontWeight:700, color:"var(--adm-text)", marginBottom:24 }}>E-posta & Şablon Yönetimi</div>

      <div style={{ display:"flex", gap:8, marginBottom:24 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8,
              border: tab===t.id ? "1px solid #c8a26b":"1px solid rgba(255,255,255,0.1)",
              background: tab===t.id ? "rgba(200,162,107,0.1)":"transparent",
              color: tab===t.id ? "#c8a26b":"var(--adm-text-muted)", cursor:"pointer", fontSize:13 }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {loading ? <p style={{ color:"var(--adm-text-muted)" }}>Yükleniyor…</p> : templates.length === 0 ? (
        <p style={{ color:"var(--adm-text-muted)", textAlign:"center", padding:"40px 0" }}>Şablon bulunamadı.</p>
      ) : templates.map(t => (
        <div key={t.id} style={cardStyle}>
          {editing === t.id ? (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={{ fontSize:12, color:"var(--adm-text-muted)", display:"block", marginBottom:4 }}>Şablon Adı</label>
                <input style={inputStyle} value={editData.name??""} onChange={e => setEditData(d => ({...d, name:e.target.value}))} />
              </div>
              {tab !== "sms" && (
                <div>
                  <label style={{ fontSize:12, color:"var(--adm-text-muted)", display:"block", marginBottom:4 }}>Konu</label>
                  <input style={inputStyle} value={editData.subject??""} onChange={e => setEditData(d => ({...d, subject:e.target.value}))} />
                </div>
              )}
              <div>
                <label style={{ fontSize:12, color:"var(--adm-text-muted)", display:"block", marginBottom:4 }}>
                  {tab === "email" ? "HTML İçerik" : "İçerik"}
                </label>
                <textarea style={{ ...inputStyle, minHeight:120, resize:"vertical" }}
                  value={tab==="email" ? (editData.body_html??"") : (editData.body??"")}
                  onChange={e => {
                    if (tab==="email" || tab==="notification") setEditData(d => ({...d, body_html:e.target.value}));
                    else setEditData(d => ({...d, body:e.target.value}));
                  }} />
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => save(t.id)} disabled={saving}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:6, background:"#c8a26b", border:"none", color:"#000", cursor:"pointer", fontWeight:700, fontSize:13 }}>
                  <Save size={14} />{saving ? "…" : "Kaydet"}
                </button>
                <button onClick={() => setEditing(null)}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:6, background:"rgba(0,0,0,0.03)", border:"1px solid rgba(255,255,255,0.1)", color:"var(--adm-text-muted)", cursor:"pointer", fontSize:13 }}>
                  <X size={14} />İptal
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div>
                  <span style={{ fontSize:14, fontWeight:600, color:"var(--adm-text)" }}>{t.name}</span>
                  {t.subject && <span style={{ fontSize:12, color:"var(--adm-text-muted)", marginLeft:12 }}>{t.subject}</span>}
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:11, color: t.is_active ? "#4ade80":"#f87171", background: t.is_active ? "rgba(74,222,128,0.1)":"rgba(248,113,113,0.1)", padding:"3px 8px", borderRadius:4 }}>
                    {t.is_active ? "Aktif":"Pasif"}
                  </span>
                  <button onClick={() => startEdit(t)}
                    style={{ background:"rgba(0,0,0,0.03)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, padding:"5px 10px", color:"var(--adm-text-muted)", cursor:"pointer" }}>
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>
              {t.variables && t.variables.length > 0 && (
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" as "wrap" }}>
                  {t.variables.map((v: string) => (
                    <code key={v} style={{ fontSize:11, background:"rgba(0,0,0,0.03)", padding:"2px 8px", borderRadius:4, color:"#c8a26b" }}>
                      {`{{${v}}}`}
                    </code>
                  ))}
                </div>
              )}
              <div style={{ marginTop:10, fontSize:13, color:"var(--adm-text-muted)", maxHeight:60, overflow:"hidden", WebkitLineClamp:2, display:"-webkit-box", WebkitBoxOrient:"vertical" as "vertical" }}>
                {tab==="email" ? (t.body_html ?? "").replace(/<[^>]+>/g,"") : t.body}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
