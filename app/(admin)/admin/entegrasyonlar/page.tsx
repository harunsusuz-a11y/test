"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Puzzle, CheckCircle, Circle, ChevronDown, ChevronUp, Save } from "lucide-react";

type Integration = { id:string; name:string; provider:string; type:string; config:Record<string,string>; is_active:boolean };

const INTEGRATION_CATALOG = [
  { provider:"google_analytics", name:"Google Analytics", type:"analytics", icon:"📊",
    fields:[{ key:"tracking_id", label:"Tracking ID (GA4)", placeholder:"G-XXXXXXXXXX" }] },
  { provider:"google_tag_manager", name:"Google Tag Manager", type:"analytics", icon:"🏷️",
    fields:[{ key:"container_id", label:"Container ID", placeholder:"GTM-XXXXXXX" }] },
  { provider:"meta_pixel", name:"Meta (Facebook) Pixel", type:"analytics", icon:"📘",
    fields:[{ key:"pixel_id", label:"Pixel ID", placeholder:"000000000000000" }] },
  { provider:"tiktok_pixel", name:"TikTok Pixel", type:"analytics", icon:"🎵",
    fields:[{ key:"pixel_id", label:"Pixel ID", placeholder:"XXXXXXXXXXXXXXXXXX" }] },
  { provider:"google_search_console", name:"Google Search Console", type:"seo", icon:"🔍",
    fields:[{ key:"verification_code", label:"Doğrulama Kodu", placeholder:"google-site-verification=..." }] },
  { provider:"smtp", name:"SMTP E-posta", type:"email", icon:"📧",
    fields:[
      { key:"host", label:"SMTP Host", placeholder:"smtp.gmail.com" },
      { key:"port", label:"Port", placeholder:"587" },
      { key:"user", label:"Kullanıcı", placeholder:"info@ventiate.com" },
      { key:"password", label:"Şifre (uygulama şifresi)", placeholder:"••••••••" },
    ]},
  { provider:"resend", name:"Resend", type:"email", icon:"✉️",
    fields:[{ key:"api_key", label:"API Key", placeholder:"re_..." }] },
  { provider:"paytr", name:"PayTR", type:"payment", icon:"💳",
    fields:[
      { key:"merchant_id", label:"Merchant ID", placeholder:"..." },
      { key:"merchant_key", label:"Merchant Key", placeholder:"..." },
      { key:"merchant_salt", label:"Merchant Salt", placeholder:"..." },
    ]},
];

export default function EntegrasyonlarPage() {
  const [integrations, setIntegrations] = useState<Record<string, Integration>>({});
  const [expanded, setExpanded] = useState<string|null>(null);
  const [formValues, setFormValues] = useState<Record<string,Record<string,string>>>({});
  const [saving, setSaving] = useState<string|null>(null);
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data } = await supabase.from("integrations").select("*");
    const map: Record<string,Integration> = {};
    (data ?? []).forEach((i: Integration) => { map[i.provider] = i; });
    setIntegrations(map);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function save(provider: string) {
    setSaving(provider);
    const vals = formValues[provider] ?? {};
    const existing = integrations[provider];
    const catalog = INTEGRATION_CATALOG.find(c => c.provider === provider)!;
    
    if (existing) {
      await supabase.from("integrations").update({
        config: { ...existing.config, ...vals },
        is_active: true, updated_at: new Date().toISOString()
      }).eq("id", existing.id);
    } else {
      await supabase.from("integrations").insert({
        name: catalog.name, provider, type: catalog.type, config: vals, is_active: true
      });
    }
    setSaving(null); setExpanded(null);
    setFormValues(f => ({ ...f, [provider]:{} }));
    load();
  }

  async function toggle(provider: string) {
    const existing = integrations[provider];
    if (!existing) return;
    await supabase.from("integrations").update({ is_active:!existing.is_active }).eq("id", existing.id);
    load();
  }

  const inputStyle: React.CSSProperties = { width:"100%", background:"var(--adm-surface)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, color:"var(--adm-text)", fontSize:13, padding:"8px 12px", boxSizing:"border-box" };

  const typeGroups: Record<string, typeof INTEGRATION_CATALOG> = INTEGRATION_CATALOG.reduce((acc, c) => {
    if (!acc[c.type]) acc[c.type] = [];
    acc[c.type].push(c);
    return acc;
  }, {} as Record<string, typeof INTEGRATION_CATALOG>);

  const TYPE_LABELS: Record<string,string> = { analytics:"Analitik & Pazarlama", email:"E-posta", payment:"Ödeme", seo:"SEO" };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <Puzzle size={22} color="#c8a26b" />
        <span style={{ fontSize:22, fontWeight:700, color:"var(--adm-text)" }}>Entegrasyonlar</span>
      </div>

      {Object.entries(typeGroups).map(([type, items]) => (
        <div key={type} style={{ marginBottom:32 }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:"var(--adm-text-muted)", textTransform:"uppercase" as "uppercase", letterSpacing:1, marginBottom:12 }}>
            {TYPE_LABELS[type] ?? type}
          </h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {items.map(c => {
              const connected = integrations[c.provider];
              const isExpanded = expanded === c.provider;
              return (
                <div key={c.provider}
                  style={{ background:"var(--adm-surface)", border:`1px solid ${connected?.is_active ? "rgba(74,222,128,0.2)":"var(--adm-border)"}`, borderRadius:10, overflow:"hidden" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:16 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <span style={{ fontSize:24 }}>{c.icon}</span>
                      <div>
                        <p style={{ fontSize:14, fontWeight:600, color:"var(--adm-text)", margin:0 }}>{c.name}</p>
                        <p style={{ fontSize:12, color: connected?.is_active ? "#4ade80":"var(--adm-text-muted)", margin:0 }}>
                          {connected?.is_active ? "Bağlı" : connected ? "Pasif" : "Bağlı değil"}
                        </p>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      {connected && (
                        <button onClick={() => toggle(c.provider)}
                          style={{ fontSize:12, padding:"4px 10px", borderRadius:5, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"var(--adm-text-muted)", cursor:"pointer" }}>
                          {connected.is_active ? "Durdur" : "Aktifleştir"}
                        </button>
                      )}
                      <button onClick={() => setExpanded(isExpanded ? null : c.provider)}
                        style={{ background:"rgba(200,162,107,0.1)", border:"1px solid rgba(200,162,107,0.2)", borderRadius:6, padding:"6px 10px", color:"#c8a26b", cursor:"pointer" }}>
                        {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:16 }}>
                      <div style={{ display:"grid", gap:10, marginBottom:12 }}>
                        {c.fields.map(f => (
                          <div key={f.key}>
                            <label style={{ fontSize:12, color:"var(--adm-text-muted)", display:"block", marginBottom:4 }}>{f.label}</label>
                            <input type={f.key.includes("password")||f.key.includes("key")||f.key.includes("salt") ? "password":"text"}
                              style={inputStyle} placeholder={f.placeholder}
                              value={formValues[c.provider]?.[f.key] ?? ""}
                              onChange={e => setFormValues(fv => ({ ...fv, [c.provider]:{ ...fv[c.provider], [f.key]:e.target.value } }))} />
                          </div>
                        ))}
                      </div>
                      <button onClick={() => save(c.provider)} disabled={saving === c.provider}
                        style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:6, background:"#c8a26b", border:"none", color:"#000", cursor:"pointer", fontWeight:700, fontSize:13 }}>
                        <Save size={14}/>{saving===c.provider ? "…":"Kaydet"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
