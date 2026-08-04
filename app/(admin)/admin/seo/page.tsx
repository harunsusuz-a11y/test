"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/ui/Toast";
import { SkeletonTable } from "@/components/admin/ui/Skeleton";
import { Search, AlertTriangle, CheckCircle, ExternalLink, Save } from "lucide-react";

type SeoRecord = {
  id: string; entity_type: string; entity_id: string | null; entity_slug: string | null;
  meta_title: string | null; meta_description: string | null; canonical_url: string | null;
  og_title: string | null; og_description: string | null;
  robots_index: boolean; robots_follow: boolean;
  created_at: string; updated_at: string | null;
};

type SeoIssue = { type: string; message: string; entity: string; severity: "error"|"warning" };

export default function SeoPage() {
  const { success, error: toastError } = useToast();
  const [records, setRecords] = useState<SeoRecord[]>([]);
  const [issues, setIssues] = useState<SeoIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"records"|"analysis"|"global">("records");
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SeoRecord>>({});
  const [globalSettings, setGlobalSettings] = useState({ site_title:"", site_description:"", default_og_image:"", robots_txt:"", google_verification:"", google_analytics:"" });
  const [savingGlobal, setSavingGlobal] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const [seoRes, productsRes, categoriesRes] = await Promise.all([
      supabase.from("seo_metadata").select("id,entity_type,entity_id,entity_slug,meta_title,meta_description,canonical_url,og_title,og_description,robots_index,robots_follow,created_at,updated_at").order("updated_at", { ascending:false }),
      supabase.from("products").select("id,name,slug,meta_title,meta_description").is("deleted_at",null).eq("status","active").limit(50),
      supabase.from("categories").select("id,name,slug,meta_title,meta_description").eq("is_active",true).limit(30),
    ]);

    setRecords((seoRes.data ?? []) as unknown as SeoRecord[]);

    // SEO analizi
    const found: SeoIssue[] = [];
    for (const p of productsRes.data ?? []) {
      if (!p.meta_title) found.push({ type:"missing_title", message:`"${p.name}" ürününde SEO başlığı eksik`, entity:p.slug, severity:"error" });
      else if (p.meta_title.length > 60) found.push({ type:"long_title", message:`"${p.name}" başlığı çok uzun (${p.meta_title.length} karakter)`, entity:p.slug, severity:"warning" });
      if (!p.meta_description) found.push({ type:"missing_desc", message:`"${p.name}" ürününde meta açıklama eksik`, entity:p.slug, severity:"warning" });
      else if (p.meta_description.length > 160) found.push({ type:"long_desc", message:`"${p.name}" açıklaması çok uzun`, entity:p.slug, severity:"warning" });
    }
    for (const c of categoriesRes.data ?? []) {
      if (!c.meta_title) found.push({ type:"missing_title", message:`"${c.name}" kategorisinde SEO başlığı eksik`, entity:c.slug, severity:"error" });
    }
    setIssues(found);

    // Global ayarlar
    const { data: settings } = await supabase.from("settings").select("key,value").in("key", ["site_title","site_description","default_og_image","robots_txt","google_verification","google_analytics"]);
    if (settings) {
      const map: Record<string,string> = {};
      settings.forEach((s: { key:string; value:unknown }) => { map[s.key] = typeof s.value === 'string' ? s.value : JSON.stringify(s.value); });
      setGlobalSettings(g => ({ ...g, ...map }));
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function saveSeoRecord() {
    if (!editing || !editForm) return;
    const { error } = await supabase.from("seo_metadata")
      .update({ ...editForm, updated_at: new Date().toISOString() }).eq("id", editing);
    if (error) toastError("Kayıt güncellenemedi");
    else { success("SEO kaydı güncellendi"); setEditing(null); load(); }
  }

  async function saveGlobal() {
    setSavingGlobal(true);
    const entries = Object.entries(globalSettings);
    for (const [key, value] of entries) {
      await supabase.from("settings").upsert({ key, value: JSON.stringify(value), setting_group:"seo" }, { onConflict:"key" });
    }
    setSavingGlobal(false);
    success("Global SEO ayarları kaydedildi");
  }

  const inputStyle: React.CSSProperties = { background:"#0f0f12", border:"1px solid rgba(255,255,255,0.1)", borderRadius:7, color:"#f2f2f3", fontSize:13, padding:"8px 12px", width:"100%", boxSizing:"border-box" };
  const sectionStyle: React.CSSProperties = { background:"#1a1a1f", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:20, marginBottom:16 };

  const errors = issues.filter(i => i.severity === "error");
  const warnings = issues.filter(i => i.severity === "warning");

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <Search size={22} color="#c8a26b" />
        <span style={{ fontSize:22, fontWeight:700, color:"#f2f2f3" }}>SEO Yönetimi</span>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:24 }}>
        {[{id:"records",label:"SEO Kayıtları"},{id:"analysis",label:`Analiz (${issues.length} sorun)`},{id:"global",label:"Global Ayarlar"}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            style={{ padding:"8px 18px", borderRadius:8, border: tab===t.id ? "1px solid #c8a26b":"1px solid rgba(255,255,255,0.08)",
              background: tab===t.id ? "rgba(200,162,107,0.12)":"transparent",
              color: tab===t.id ? "#c8a26b":"#9b9ba4", cursor:"pointer", fontSize:13 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* SEO Kayıtları */}
      {tab === "records" && (
        loading ? <SkeletonTable rows={6} cols={5}/> : (
          <div style={{ background:"#1a1a1f", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"rgba(255,255,255,0.02)" }}>
                  {["Tür","Slug","Başlık","Açıklama","Index","İşlem"].map(h => (
                    <th key={h} style={{ textAlign:"left", padding:"12px 14px", fontSize:11, color:"#6b6b76", fontWeight:500, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding:40, textAlign:"center", color:"#6b6b76" }}>Kayıt bulunamadı.</td></tr>
                ) : records.map(r => (
                  <tr key={r.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding:"10px 14px" }}>
                      <span style={{ fontSize:11, background:"rgba(255,255,255,0.05)", padding:"2px 8px", borderRadius:10, color:"#9b9ba4" }}>{r.entity_type}</span>
                    </td>
                    <td style={{ padding:"10px 14px", fontSize:12, color:"#6b6b76", fontFamily:"monospace" }}>{r.entity_slug ?? r.entity_id ?? "-"}</td>
                    <td style={{ padding:"10px 14px", fontSize:13 }}>
                      {r.meta_title ? (
                        <div>
                          <span style={{ color: r.meta_title?.length > 60 ? "#f59e0b":"#f2f2f3" }}>{r.meta_title?.slice(0,50)}{r.meta_title?.length > 50 ? "…":""}</span>
                          <span style={{ fontSize:10, color:"#6b6b76", marginLeft:6 }}>{r.meta_title?.length}/60</span>
                        </div>
                      ) : <span style={{ color:"#f87171", fontSize:12 }}>Eksik</span>}
                    </td>
                    <td style={{ padding:"10px 14px", fontSize:12, color:"#9b9ba4" }}>
                      {r.meta_description ? `${r.meta_description?.slice(0,40)}…` : <span style={{ color:"#f87171" }}>Eksik</span>}
                    </td>
                    <td style={{ padding:"10px 14px" }}>
                      <span style={{ fontSize:11, color: r.robots_index ? "#4ade80":"#f87171" }}>
                        {r.robots_index ? "Index":"NoIndex"}
                      </span>
                    </td>
                    <td style={{ padding:"10px 14px" }}>
                      <button onClick={() => { setEditing(r.id); setEditForm(r); }}
                        style={{ fontSize:12, padding:"4px 10px", borderRadius:6, border:"1px solid rgba(200,162,107,0.3)", background:"rgba(200,162,107,0.08)", color:"#c8a26b", cursor:"pointer" }}>
                        Düzenle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Analiz */}
      {tab === "analysis" && (
        <div>
          {issues.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 0" }}>
              <CheckCircle size={48} color="#4ade80" style={{ margin:"0 auto 16px" }} />
              <p style={{ color:"#4ade80", fontSize:16, fontWeight:600 }}>SEO sorunları bulunamadı!</p>
              <p style={{ color:"#6b6b76", fontSize:13 }}>Tüm sayfalar SEO açısından temiz görünüyor.</p>
            </div>
          ) : (
            <div>
              {errors.length > 0 && (
                <div style={{ marginBottom:20 }}>
                  <h3 style={{ fontSize:14, fontWeight:600, color:"#f87171", marginBottom:10 }}>
                    <AlertTriangle size={14} style={{ display:"inline", marginRight:6 }} />
                    Hatalar ({errors.length})
                  </h3>
                  {errors.map((issue, i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"10px 14px", background:"rgba(248,113,113,0.05)", border:"1px solid rgba(248,113,113,0.15)", borderRadius:8, marginBottom:6, fontSize:13 }}>
                      <span style={{ color:"#f2f2f3" }}>{issue.message}</span>
                      <code style={{ color:"#6b6b76", fontSize:11 }}>{issue.entity}</code>
                    </div>
                  ))}
                </div>
              )}
              {warnings.length > 0 && (
                <div>
                  <h3 style={{ fontSize:14, fontWeight:600, color:"#f59e0b", marginBottom:10 }}>
                    Uyarılar ({warnings.length})
                  </h3>
                  {warnings.map((issue, i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"10px 14px", background:"rgba(245,158,11,0.05)", border:"1px solid rgba(245,158,11,0.15)", borderRadius:8, marginBottom:6, fontSize:13 }}>
                      <span style={{ color:"#f2f2f3" }}>{issue.message}</span>
                      <code style={{ color:"#6b6b76", fontSize:11 }}>{issue.entity}</code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Global Ayarlar */}
      {tab === "global" && (
        <div style={{ maxWidth:640 }}>
          <div style={sectionStyle}>
            <p style={{ fontSize:14, fontWeight:600, color:"#f2f2f3", marginBottom:16 }}>Site Bilgileri</p>
            <div style={{ display:"grid", gap:14 }}>
              {[
                { key:"site_title", label:"Site Başlığı", placeholder:"Venti-Ate — Fındığın Rafine Hali" },
                { key:"site_description", label:"Site Açıklaması", placeholder:"Giresun fındığından üretilen %25 protein bar ve kremalar." },
                { key:"default_og_image", label:"Varsayılan OG Görseli URL", placeholder:"https://ventiate.com/og-image.jpg" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:4 }}>{f.label}</label>
                  <input style={inputStyle} placeholder={f.placeholder}
                    value={globalSettings[f.key as keyof typeof globalSettings]}
                    onChange={e => setGlobalSettings(g => ({ ...g, [f.key]: e.target.value }))} />
                </div>
              ))}
            </div>
          </div>
          <div style={sectionStyle}>
            <p style={{ fontSize:14, fontWeight:600, color:"#f2f2f3", marginBottom:16 }}>Doğrulama & Analytics</p>
            <div style={{ display:"grid", gap:14 }}>
              {[
                { key:"google_verification", label:"Google Search Console Doğrulama Kodu", placeholder:"google-site-verification=..." },
                { key:"google_analytics", label:"Google Analytics / GA4 ID", placeholder:"G-XXXXXXXXXX" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:4 }}>{f.label}</label>
                  <input style={inputStyle} placeholder={f.placeholder}
                    value={globalSettings[f.key as keyof typeof globalSettings]}
                    onChange={e => setGlobalSettings(g => ({ ...g, [f.key]: e.target.value }))} />
                </div>
              ))}
            </div>
          </div>
          <div style={sectionStyle}>
            <p style={{ fontSize:14, fontWeight:600, color:"#f2f2f3", marginBottom:16 }}>robots.txt</p>
            <textarea style={{ ...inputStyle, minHeight:100, resize:"vertical" as "vertical", fontFamily:"monospace" }}
              value={globalSettings.robots_txt || "User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://ventiate.com/sitemap.xml"}
              onChange={e => setGlobalSettings(g => ({ ...g, robots_txt: e.target.value }))} />
          </div>
          <button onClick={saveGlobal} disabled={savingGlobal}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 24px", borderRadius:8, background:"#c8a26b", border:"none", color:"#000", cursor:savingGlobal ? "not-allowed":"pointer", fontWeight:700, fontSize:14, opacity:savingGlobal ? .7:1 }}>
            <Save size={15}/>{savingGlobal ? "Kaydediliyor…":"Global Ayarları Kaydet"}
          </button>
        </div>
      )}

      {/* SEO Kayıt Düzenleme Modal */}
      {editing && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}
          onClick={() => setEditing(null)}>
          <div style={{ background:"#1a1a1f", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:28, width:560, maxWidth:"94vw", maxHeight:"90vh", overflowY:"auto" as "auto" }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize:16, fontWeight:700, color:"#f2f2f3", marginBottom:20 }}>SEO Kaydını Düzenle</h3>
            <div style={{ display:"grid", gap:14 }}>
              {[
                { key:"meta_title", label:"SEO Başlığı (maks 60 karakter)" },
                { key:"meta_description", label:"Meta Açıklama (maks 160 karakter)" },
                { key:"og_title", label:"Open Graph Başlığı" },
                { key:"og_description", label:"Open Graph Açıklaması" },
                { key:"canonical_url", label:"Canonical URL" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:4 }}>{f.label}</label>
                  {f.key === "meta_description" || f.key === "og_description" ? (
                    <textarea style={{ ...inputStyle, minHeight:60, resize:"vertical" as "vertical" }}
                      value={(editForm as Record<string,string|null>)[f.key] ?? ""}
                      onChange={e => setEditForm(form => ({ ...form, [f.key]: e.target.value }))} />
                  ) : (
                    <input style={inputStyle}
                      value={(editForm as Record<string,string|null>)[f.key] ?? ""}
                      onChange={e => setEditForm(form => ({ ...form, [f.key]: e.target.value }))} />
                  )}
                </div>
              ))}
              <div style={{ display:"flex", gap:20 }}>
                <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:"#9b9ba4" }}>
                  <input type="checkbox" checked={editForm.robots_index !== false}
                    onChange={e => setEditForm(f => ({ ...f, robots_index: e.target.checked }))} style={{ accentColor:"#c8a26b" }} />
                  Indexle (robots index)
                </label>
                <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:"#9b9ba4" }}>
                  <input type="checkbox" checked={editForm.robots_follow !== false}
                    onChange={e => setEditForm(f => ({ ...f, robots_follow: e.target.checked }))} style={{ accentColor:"#c8a26b" }} />
                  Takip et (robots follow)
                </label>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:24 }}>
              <button onClick={saveSeoRecord}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 22px", borderRadius:8, background:"#c8a26b", border:"none", color:"#000", cursor:"pointer", fontWeight:700, fontSize:13 }}>
                <Save size={14}/> Kaydet
              </button>
              <button onClick={() => setEditing(null)}
                style={{ padding:"9px 18px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#9b9ba4", cursor:"pointer" }}>
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
