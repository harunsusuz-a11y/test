"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Setting { key:string; value:any; setting_group:string; label:string|null; }

const SECTIONS = [
  { id:"general", label:"Site Bilgileri" },
  { id:"shipping", label:"Kargo" },
  { id:"notifications", label:"Bildirimler" },
  { id:"seo", label:"SEO & Meta" },
  { id:"integrations", label:"Entegrasyonlar" },
  { id:"api_keys", label:"API Anahtarları" },
  { id:"danger", label:"Tehlike Bölgesi" },
];

const DEFAULTS: Record<string,any> = {
  site_name:"Venti-Ate", site_email:"info@venti-ate.com",
  site_phone:"", site_address:"Bursa, Türkiye",
  currency:"TRY", timezone:"Europe/Istanbul",
  free_shipping_threshold:300, standard_shipping_cost:29.9,
  express_enabled:false, express_cost:59.9,
  notif_new_order:true, notif_low_stock:true, notif_delivered:false,
  seo_title:"Venti-Ate — Fındık Bazlı Protein Bar & Krema",
  seo_desc:"Giresun fındığından üretilen, %25 protein içeren doğal protein bar ve fındık kreması.",
  og_image:"/images/og-default.jpg",
  google_analytics:"", google_tag_manager:"", facebook_pixel:"", tiktok_pixel:"",
  maintenance_mode:false,
};

const ENV_KEYS = [
  { key: "NEXT_PUBLIC_SITE_URL", label: "Site URL", hint: "Örn: https://ventiate.com" },
  { key: "PAYTR_MERCHANT_ID", label: "PayTR Merchant ID", hint: "PayTR panelinizden alın" },
  { key: "PAYTR_MERCHANT_KEY", label: "PayTR Merchant Key", hint: "PayTR panelinizden alın" },
  { key: "PAYTR_MERCHANT_SALT", label: "PayTR Merchant Salt", hint: "PayTR panelinizden alın" },
  { key: "RESEND_API_KEY", label: "Resend API Key", hint: "resend.com → API Keys" },
  { key: "YURTICI_USERNAME", label: "Yurtiçi Kargo Kullanıcı Adı", hint: "Yurtiçi müşteri API kullanıcı adı" },
  { key: "YURTICI_PASSWORD", label: "Yurtiçi Kargo Şifresi", hint: "Yurtiçi müşteri API şifresi" },
  { key: "YURTICI_CUSTOMER_NO", label: "Yurtiçi Müşteri No", hint: "Yurtiçi kargo müşteri numarası" },
  { key: "NEXT_PUBLIC_SUPABASE_URL", label: "Supabase URL", hint: "Supabase proje URL'si" },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", label: "Supabase Anon Key", hint: "Supabase projesinden" },
];

function ApiKeysSection() {
  const [values, setValues] = React.useState<Record<string,string>>({});
  const [saving, setSaving] = React.useState<string|null>(null);
  const [status, setStatus] = React.useState<Record<string,string>>({});

  async function save(key: string) {
    const val = values[key];
    if (!val?.trim()) return;
    setSaving(key);
    setStatus(s => ({ ...s, [key]: "" }));
    const res = await fetch("/api/admin/env", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: val }),
    });
    const data = await res.json();
    setStatus(s => ({ ...s, [key]: data.ok ? "✓ Kaydedildi" : (data.error || "Hata") }));
    setSaving(null);
    if (data.ok) setValues(v => ({ ...v, [key]: "" }));
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <div style={{ background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.3)", borderRadius:8, padding:"12px 16px", fontSize:13, color:"#92400e" }}>
        ⚠️ Bu değerler Vercel ortam değişkenlerine kaydedilir. Kaydettikten sonra yeni bir deploy başlatmanız gerekir.
        VERCEL_TOKEN env değişkeni de Vercel&apos;e elle girilmelidir (bir kerelik).
      </div>
      {ENV_KEYS.map(({ key, label, hint }) => (
        <div key={key} style={{ background:"#1a1a1f", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:20 }}>
          <div style={{ marginBottom:8 }}>
            <span style={{ fontSize:13, fontWeight:600, color:"#f2f2f3" }}>{label}</span>
            <code style={{ marginLeft:8, fontSize:11, color:"#6b6b76", background:"rgba(255,255,255,0.05)", padding:"2px 6px", borderRadius:4 }}>{key}</code>
          </div>
          <p style={{ fontSize:12, color:"#6b6b76", marginBottom:12 }}>{hint}</p>
          <div style={{ display:"flex", gap:8 }}>
            <input
              type="password"
              placeholder="Yeni değer girin…"
              value={values[key] || ""}
              onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && save(key)}
              style={{ flex:1, background:"#151518", border:"1px solid rgba(255,255,255,0.10)", borderRadius:7, color:"#f2f2f3", fontSize:13, padding:"8px 12px", outline:"none" }}
            />
            <button
              onClick={() => save(key)}
              disabled={saving === key || !values[key]?.trim()}
              style={{ background: saving === key ? "rgba(200,162,107,0.5)" : "#c8a26b", border:"none", borderRadius:7, color:"#000", fontSize:13, fontWeight:700, padding:"8px 16px", cursor: saving === key ? "not-allowed" : "pointer", whiteSpace:"nowrap" }}
            >
              {saving === key ? "…" : "Kaydet"}
            </button>
          </div>
          {status[key] && (
            <p style={{ marginTop:8, fontSize:12, color: status[key].startsWith("✓") ? "#4ade80" : "#f87171" }}>
              {status[key]}
            </p>
          )}
        </div>
      ))}
      <div style={{ background:"#1a1a1f", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:20 }}>
        <p style={{ fontSize:13, fontWeight:600, color:"#f2f2f3", marginBottom:8 }}>Redeploy</p>
        <p style={{ fontSize:12, color:"#6b6b76", marginBottom:12 }}>Env değişkenlerini kaydettikten sonra yeni deploy başlatın.</p>
        <a
          href="https://vercel.com/urlll/test/deployments"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display:"inline-block", background:"#c8a26b", borderRadius:7, color:"#000", fontSize:13, fontWeight:700, padding:"8px 16px", textDecoration:"none" }}
        >
          Vercel Dashboard → Redeploy
        </a>
      </div>
    </div>
  );
}

export default function AdminAyarlar() {
  const [settings, setSettings] = useState<Record<string,any>>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("general");
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("settings").select("*");
    if (data && data.length > 0) {
      const map: Record<string,any> = { ...DEFAULTS };
      (data as Setting[]).forEach(s => {
        try { map[s.key] = typeof s.value === "string" ? JSON.parse(s.value) : s.value; }
        catch { map[s.key] = s.value; }
      });
      setSettings(map);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true);
    const { data:{user} } = await supabase.auth.getUser();
    const upserts = Object.entries(settings).map(([key,value]) => ({
      key, value: JSON.stringify(value),
      setting_group: getGroup(key), label:key, updated_by:user?.id,
      updated_at:new Date().toISOString(),
    }));
    await supabase.from("settings").upsert(upserts, { onConflict:"key" });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function getGroup(key:string) {
    if (["site_name","site_email","site_phone","site_address","currency","timezone"].includes(key)) return "general";
    if (key.startsWith("notif_")) return "notifications";
    if (["free_shipping_threshold","standard_shipping_cost","express_enabled","express_cost"].includes(key)) return "shipping";
    if (["seo_title","seo_desc","og_image"].includes(key)) return "seo";
    if (["google_analytics","google_tag_manager","facebook_pixel","tiktok_pixel"].includes(key)) return "integrations";
    return "system";
  }

  function S(key:string) { return settings[key] ?? DEFAULTS[key]; }
  function set(key:string, val:any) { setSettings(prev => ({ ...prev, [key]:val })); }

  if (loading) return <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div>;

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">Ayarlar</div><div className="adm-page-sub">Site geneli konfigürasyon</div></div>
        <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>
          {saving?"Kaydediliyor…":saved?"✓ Kaydedildi":"Kaydet"}
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:20, alignItems:"start" }}>
        {/* Nav */}
        <div className="adm-card" style={{ padding:"8px 6px", position:"sticky", top:24 }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              width:"100%", display:"block", padding:"7px 10px", borderRadius:6, border:"none",
              fontSize:12, textAlign:"left", cursor:"pointer",
              background:activeSection===s.id?"var(--adm-accent-dim)":"transparent",
              color:activeSection===s.id?"var(--adm-accent)":"var(--adm-text-3)",
              fontFamily:"var(--adm-font)", transition:"background 0.1s",
            }}>{s.label}</button>
          ))}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {activeSection==="general" && (
            <div className="adm-card">
              <div className="adm-card-header"><span className="adm-card-title">Site Bilgileri</span></div>
              <div className="adm-card-body">
                <div className="adm-field-row">
                  <F label="Site Adı"><input className="adm-input" value={S("site_name")} onChange={e=>set("site_name",e.target.value)} /></F>
                  <F label="Para Birimi"><select className="adm-select" value={S("currency")} onChange={e=>set("currency",e.target.value)}><option value="TRY">TRY — Türk Lirası</option><option value="USD">USD — Dolar</option><option value="EUR">EUR — Euro</option></select></F>
                </div>
                <div className="adm-field-row">
                  <F label="E-posta"><input className="adm-input" type="email" value={S("site_email")} onChange={e=>set("site_email",e.target.value)} /></F>
                  <F label="Telefon"><input className="adm-input" value={S("site_phone")} onChange={e=>set("site_phone",e.target.value)} /></F>
                </div>
                <F label="Adres"><input className="adm-input" value={S("site_address")} onChange={e=>set("site_address",e.target.value)} /></F>
                <F label="Saat Dilimi"><select className="adm-select" value={S("timezone")} onChange={e=>set("timezone",e.target.value)}><option value="Europe/Istanbul">Europe/Istanbul (UTC+3)</option><option value="UTC">UTC</option></select></F>
              </div>
            </div>
          )}

          {activeSection==="shipping" && (
            <div className="adm-card">
              <div className="adm-card-header"><span className="adm-card-title">Kargo Ayarları</span></div>
              <div className="adm-card-body">
                <div className="adm-field-row">
                  <F label="Ücretsiz Kargo Limiti (₺)"><input className="adm-input" type="number" value={S("free_shipping_threshold")} onChange={e=>set("free_shipping_threshold",Number(e.target.value))} /></F>
                  <F label="Standart Kargo (₺)"><input className="adm-input" type="number" value={S("standard_shipping_cost")} onChange={e=>set("standard_shipping_cost",Number(e.target.value))} /></F>
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid var(--adm-border)", marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:500, color:"var(--adm-text-2)" }}>Ekspres Kargo</div>
                    <div style={{ fontSize:11, color:"var(--adm-text-4)" }}>Ertesi gün teslimat</div>
                  </div>
                  <div className={`adm-toggle${S("express_enabled")?" on":""}`} onClick={()=>set("express_enabled",!S("express_enabled"))} />
                </div>
                {S("express_enabled") && (
                  <F label="Ekspres Kargo Ücreti (₺)"><input className="adm-input" type="number" value={S("express_cost")} onChange={e=>set("express_cost",Number(e.target.value))} /></F>
                )}
              </div>
            </div>
          )}

          {activeSection==="notifications" && (
            <div className="adm-card">
              <div className="adm-card-header"><span className="adm-card-title">Bildirimler</span></div>
              <div className="adm-card-body">
                {[
                  { key:"notif_new_order", label:"Yeni sipariş bildirimi", sub:"Her sipariş geldiğinde bildir" },
                  { key:"notif_low_stock", label:"Düşük stok uyarısı", sub:"Stok kritik seviyeye düşünce bildir" },
                  { key:"notif_delivered", label:"Teslim bildirimi", sub:"Sipariş teslim edilince bildir" },
                ].map(item => (
                  <div key={item.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid var(--adm-border)" }}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:500, color:"var(--adm-text-2)" }}>{item.label}</div>
                      <div style={{ fontSize:11, color:"var(--adm-text-4)" }}>{item.sub}</div>
                    </div>
                    <div className={`adm-toggle${S(item.key)?" on":""}`} onClick={()=>set(item.key,!S(item.key))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection==="seo" && (
            <div className="adm-card">
              <div className="adm-card-header"><span className="adm-card-title">SEO & Meta</span></div>
              <div className="adm-card-body">
                <F label="Meta Başlık">
                  <input className="adm-input" value={S("seo_title")} onChange={e=>set("seo_title",e.target.value)} maxLength={60} />
                  <div style={{ fontSize:10, color:S("seo_title").length>55?"var(--adm-yellow)":"var(--adm-text-4)", marginTop:4 }}>{S("seo_title").length}/60</div>
                </F>
                <F label="Meta Açıklama">
                  <textarea className="adm-textarea" rows={3} value={S("seo_desc")} onChange={e=>set("seo_desc",e.target.value)} maxLength={160} />
                  <div style={{ fontSize:10, color:S("seo_desc").length>150?"var(--adm-yellow)":"var(--adm-text-4)", marginTop:4 }}>{S("seo_desc").length}/160</div>
                </F>
                <F label="OG Görsel URL"><input className="adm-input" value={S("og_image")} onChange={e=>set("og_image",e.target.value)} /></F>
                {/* Google Preview */}
                <div style={{ background:"var(--adm-surface-2)", border:"1px solid var(--adm-border)", borderRadius:8, padding:14, marginTop:8 }}>
                  <div style={{ fontSize:10, color:"var(--adm-text-4)", marginBottom:6 }}>Google önizleme</div>
                  <div style={{ fontSize:14, color:"#8ab4f8", fontWeight:500, marginBottom:3 }}>{S("seo_title")||"Başlık"}</div>
                  <div style={{ fontSize:12, color:"var(--adm-text-3)" }}>{S("seo_desc")||"Açıklama"}</div>
                </div>
              </div>
            </div>
          )}

          {activeSection==="integrations" && (
            <div className="adm-card">
              <div className="adm-card-header"><span className="adm-card-title">Entegrasyonlar</span></div>
              <div className="adm-card-body">
                {[
                  { key:"google_analytics", label:"Google Analytics ID", ph:"G-XXXXXXXXXX" },
                  { key:"google_tag_manager", label:"Google Tag Manager ID", ph:"GTM-XXXXXXX" },
                  { key:"facebook_pixel", label:"Facebook Pixel ID", ph:"1234567890" },
                  { key:"tiktok_pixel", label:"TikTok Pixel ID", ph:"CXXXXXXXXXXXXXXXXXX" },
                ].map(item => (
                  <F key={item.key} label={item.label}>
                    <input className="adm-input" style={{ fontFamily:"var(--adm-mono)" }} value={S(item.key)} onChange={e=>set(item.key,e.target.value)} placeholder={item.ph} />
                  </F>
                ))}
              </div>
            </div>
          )}

          {activeSection==="api_keys" && (
            <div className="adm-card">
              <div className="adm-card-header"><span className="adm-card-title">API Anahtarları</span></div>
              <div className="adm-card-body"><ApiKeysSection /></div>
            </div>
          )}

          {activeSection==="danger" && (
            <div className="adm-card" style={{ border:"1px solid rgba(248,113,113,0.2)" }}>
              <div className="adm-card-header" style={{ borderColor:"rgba(248,113,113,0.15)" }}>
                <span className="adm-card-title" style={{ color:"var(--adm-red)" }}>Tehlike Bölgesi</span>
              </div>
              <div className="adm-card-body">
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid var(--adm-border)" }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:500, color:"var(--adm-text-2)" }}>Bakım Modu</div>
                    <div style={{ fontSize:11, color:"var(--adm-text-4)" }}>Site ziyaretçilere kapalı, adminler erişebilir</div>
                  </div>
                  <div className={`adm-toggle${S("maintenance_mode")?" on":""}`} onClick={()=>set("maintenance_mode",!S("maintenance_mode"))} />
                </div>
                <div style={{ padding:"10px 0" }}>
                  <div style={{ fontSize:12, fontWeight:500, color:"var(--adm-red)", marginBottom:4 }}>Oturum Kapat</div>
                  <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={async()=>{ const s=createClient(); await s.auth.signOut(); window.location.href="/giris"; }}>Çıkış Yap</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function F({ label, children }:{ label:string; children:React.ReactNode }) {
  return <div className="adm-field"><label className="adm-label-text">{label}</label>{children}</div>;
}
