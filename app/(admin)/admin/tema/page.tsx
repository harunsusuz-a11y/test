"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/ui/Toast";
import { Palette, Save, RefreshCw, Eye, EyeOff, GripVertical, Plus, Trash2, X } from "lucide-react";

type NavItem = { id: string; label: string; url: string; target: string; sort_order: number; is_active: boolean; children?: NavItem[] };
type ThemeSettings = {
  primary_color: string; secondary_color: string; accent_color: string; bg_color: string;
  text_color: string; font_heading: string; font_body: string;
  logo_url: string; logo_width: number;
  announcement_text: string; announcement_active: boolean;
  footer_tagline: string; footer_email: string; footer_phone: string;
  facebook: string; instagram: string; twitter: string; tiktok: string;
};

const DEFAULT_THEME: ThemeSettings = {
  primary_color: "#56312D", secondary_color: "#415D1F", accent_color: "#F9C89E",
  bg_color: "#FFF6F0", text_color: "#1a1a1a",
  font_heading: "Fraunces Variable", font_body: "Outfit Variable",
  logo_url: "", logo_width: 120,
  announcement_text: "İlk siparişe %10 indirim — kod: VENTI10",
  announcement_active: true,
  footer_tagline: "Fındığın rafine hali.", footer_email: "", footer_phone: "",
  facebook: "", instagram: "", twitter: "", tiktok: "",
};

const FONT_OPTIONS = ["Fraunces Variable","Outfit Variable","Inter","Georgia","Playfair Display","Montserrat","Lato","Poppins"];
const TABS = ["Renkler","Fontlar","Logo & Duyuru","Navigasyon","Footer & Sosyal"];

export default function TemaPage() {
  const { success, error: toastError } = useToast();
  const [tab, setTab] = useState(0);
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [footerItems, setFooterItems] = useState<NavItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<{ label: string; url: string; menu: "header" | "footer" } | null>(null);
  const supabase = createClient();

  const load = useCallback(async () => {
    // Tema ayarları
    const { data: settings } = await supabase.from("settings")
      .select("key,value").eq("setting_group", "theme");
    if (settings) {
      const map: Record<string, unknown> = {};
      settings.forEach((s: { key: string; value: unknown }) => {
        try { map[s.key] = typeof s.value === "string" ? JSON.parse(s.value) : s.value; }
        catch { map[s.key] = s.value; }
      });
      setTheme(t => ({ ...t, ...map }));
    }

    // Menüler
    const { data: menus } = await supabase.from("menus").select("id,location");
    if (!menus) return;

    const headerMenu = menus.find((m: { location: string }) => m.location === "header");
    const footerMenu = menus.find((m: { location: string }) => m.location === "footer");

    if (headerMenu) {
      const { data: items } = await supabase.from("menu_items")
        .select("*").eq("menu_id", headerMenu.id).is("parent_id", null).order("sort_order");
      setNavItems((items ?? []) as NavItem[]);
    }
    if (footerMenu) {
      const { data: items } = await supabase.from("menu_items")
        .select("*").eq("menu_id", footerMenu.id).is("parent_id", null).order("sort_order");
      setFooterItems((items ?? []) as NavItem[]);
    }
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function saveTheme() {
    setSaving(true);
    try {
      const entries = Object.entries(theme);
      await Promise.all(entries.map(([key, value]) =>
        supabase.from("settings").upsert(
          { key, value: JSON.stringify(value), setting_group: "theme" },
          { onConflict: "key" }
        )
      ));
      success("Tema kaydedildi");
    } catch { toastError("Kayıt başarısız"); }
    setSaving(false);
  }

  async function saveNavOrder(items: NavItem[], menuLocation: string) {
    const { data: menus } = await supabase.from("menus").select("id,location").eq("location", menuLocation).single();
    if (!menus) return;
    await Promise.all(items.map((item, idx) =>
      supabase.from("menu_items").update({ sort_order: idx }).eq("id", item.id)
    ));
    success("Sıra kaydedildi");
  }

  async function toggleItem(id: string, current: boolean, menu: "header" | "footer") {
    await supabase.from("menu_items").update({ is_active: !current }).eq("id", id);
    load();
  }

  async function deleteItem(id: string) {
    if (!confirm("Bu menü öğesini sil?")) return;
    await supabase.from("menu_items").delete().eq("id", id);
    load();
  }

  async function addItem() {
    if (!newItem?.label) return;
    const { data: menus } = await supabase.from("menus").select("id,location").eq("location", newItem.menu === "header" ? "header" : "footer").single();
    if (!menus) { toastError("Menü bulunamadı"); return; }
    await supabase.from("menu_items").insert({
      menu_id: menus.id, label: newItem.label, url: newItem.url || "/",
      target: "_self", sort_order: 99, is_active: true,
    });
    setNewItem(null); load();
  }

  function onDragStart(id: string) { setDragging(id); }
  function onDragOver(e: React.DragEvent, id: string) { e.preventDefault(); setDragOver(id); }
  function onDrop(e: React.DragEvent, targetId: string, items: NavItem[], setItems: (i: NavItem[]) => void, menu: string) {
    e.preventDefault();
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return; }
    const from = items.findIndex(i => i.id === dragging);
    const to = items.findIndex(i => i.id === targetId);
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next.map((item, idx) => ({ ...item, sort_order: idx })));
    setDragging(null); setDragOver(null);
    saveNavOrder(next, menu);
  }

  const T = (key: keyof ThemeSettings, value: unknown) => setTheme(t => ({ ...t, [key]: value }));

  const input: React.CSSProperties = { background:"var(--adm-bg)", border:"1px solid var(--adm-border)", borderRadius:7, color:"var(--adm-text)", fontSize:13, padding:"8px 12px", width:"100%", boxSizing:"border-box" };
  const card: React.CSSProperties = { background:"var(--adm-surface)", border:"1px solid var(--adm-border)", borderRadius:10, padding:20, marginBottom:16 };
  const label: React.CSSProperties = { fontSize:12, color:"var(--adm-text-muted)", display:"block", marginBottom:4 };

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `logo/logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      T("logo_url", data.publicUrl);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLogoUploading(false);
    }
  }

  function NavEditor({ items, setItems, menu }: { items: NavItem[]; setItems: (i: NavItem[]) => void; menu: "header" | "footer" }) {
  return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span style={{ fontSize:14, fontWeight:600, color:"var(--adm-text)" }}>
            {menu === "header" ? "Header Navigasyon" : "Footer Navigasyon"}
          </span>
          <button onClick={() => setNewItem({ label:"", url:"", menu })}
            style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:6, background:"#c8a26b", border:"none", color:"#000", cursor:"pointer", fontWeight:700, fontSize:12 }}>
            <Plus size={12}/> Öğe Ekle
          </button>
        </div>

        {newItem?.menu === menu && (
          <div style={{ background:"var(--adm-surface)", border:"1px solid rgba(200,162,107,0.5)", borderRadius:8, padding:14, marginBottom:12, display:"flex", gap:8, alignItems:"flex-end" }}>
            <div style={{ flex:1 }}>
              <label style={label}>Başlık</label>
              <input style={input} value={newItem.label} onChange={e => setNewItem(n => n ? {...n, label:e.target.value} : null)} placeholder="Mağaza" />
            </div>
            <div style={{ flex:1 }}>
              <label style={label}>URL</label>
              <input style={input} value={newItem.url} onChange={e => setNewItem(n => n ? {...n, url:e.target.value} : null)} placeholder="/magaza" />
            </div>
            <button onClick={addItem} style={{ padding:"8px 14px", borderRadius:6, background:"#c8a26b", border:"none", color:"#000", cursor:"pointer", fontWeight:700, fontSize:12 }}>Ekle</button>
            <button onClick={() => setNewItem(null)} style={{ padding:"8px 10px", borderRadius:6, background:"transparent", border:"1px solid var(--adm-border)", color:"var(--adm-text-muted)", cursor:"pointer" }}><X size={12}/></button>
          </div>
        )}

        {items.length === 0 ? (
          <p style={{ color:"var(--adm-text-muted)", fontSize:13, textAlign:"center", padding:"20px 0" }}>Menü boş.</p>
        ) : items.map(item => (
          <div key={item.id}
            draggable
            onDragStart={() => onDragStart(item.id)}
            onDragOver={e => onDragOver(e, item.id)}
            onDrop={e => onDrop(e, item.id, items, setItems, menu)}
            onDragEnd={() => { setDragging(null); setDragOver(null); }}
            style={{
              display:"flex", alignItems:"center", gap:10,
              background: dragging===item.id ? "rgba(200,162,107,0.1)" : dragOver===item.id ? "rgba(200,162,107,0.15)" : "var(--adm-bg)",
              border:`1px solid ${dragOver===item.id ? "rgba(200,162,107,0.4)" : "var(--adm-border)"}`,
              borderRadius:8, padding:"10px 12px", marginBottom:6, cursor:"grab",
              opacity: dragging===item.id ? 0.5 : 1, transition:"all .15s",
            }}>
            <GripVertical size={14} color="var(--adm-text-muted)" style={{ flexShrink:0 }} />
            <span style={{ flex:1, fontSize:13, color: item.is_active ? "var(--adm-text)":"var(--adm-text-muted)" }}>{item.label}</span>
            <span style={{ fontSize:11, color:"var(--adm-text-muted)", fontFamily:"monospace" }}>{item.url}</span>
            <button onClick={() => toggleItem(item.id, item.is_active, menu)}
              style={{ fontSize:11, padding:"2px 8px", borderRadius:4, border:`1px solid ${item.is_active ? "#4ade80":"var(--adm-text-muted)"}`, background: item.is_active ? "rgba(74,222,128,0.1)":"transparent", color: item.is_active ? "#4ade80":"var(--adm-text-muted)", cursor:"pointer" }}>
              {item.is_active ? "Aktif":"Pasif"}
            </button>
            <button onClick={() => deleteItem(item.id)}
              style={{ background:"rgba(248,113,113,0.1)", border:"none", borderRadius:5, padding:"4px 7px", color:"#f87171", cursor:"pointer" }}>
              <Trash2 size={12}/>
            </button>
          </div>
        ))}
        <p style={{ fontSize:11, color:"var(--adm-text-muted)", textAlign:"center", marginTop:8 }}>Sürükleyerek sırayı değiştirin</p>
      </div>
    );
  }

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Palette size={22} color="#c8a26b" />
          <span style={{ fontSize:22, fontWeight:700, color:"var(--adm-text)" }}>Tema & Görünüm Editörü</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => setPreview(p => !p)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:8, border:"1px solid var(--adm-border)", background:"transparent", color:"var(--adm-text-muted)", cursor:"pointer", fontSize:13 }}>
            {preview ? <EyeOff size={14}/> : <Eye size={14}/>} {preview ? "Önizlemeyi Kapat":"Önizle"}
          </button>
          <button onClick={saveTheme} disabled={saving}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, background:"#c8a26b", border:"none", color:"#000", cursor:saving?"not-allowed":"pointer", fontWeight:700, fontSize:13, opacity:saving?.7:1 }}>
            <Save size={14}/>{saving ? "…":"Kaydet"}
          </button>
        </div>
      </div>

      {/* Önizleme bandı */}
      {preview && (
        <div style={{ marginBottom:24, borderRadius:10, overflow:"hidden", border:"1px solid var(--adm-border)" }}>
          <div style={{ background:theme.primary_color, color:theme.accent_color, padding:"8px 20px", fontSize:12, textAlign:"center" }}>
            {theme.announcement_text}
          </div>
          <div style={{ background:theme.bg_color, padding:"14px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontWeight:700, color:theme.primary_color, fontSize:16 }}>venti-ate</span>
            <div style={{ display:"flex", gap:20 }}>
              {navItems.filter(i => i.is_active).map(i => (
                <span key={i.id} style={{ fontSize:13, color:theme.text_color }}>{i.label}</span>
              ))}
            </div>
            <span style={{ fontSize:12, color:theme.secondary_color, fontWeight:600 }}>Sepetim</span>
          </div>
          <div style={{ background:theme.primary_color, color:theme.accent_color, padding:"20px 24px", fontSize:12 }}>
            <p style={{ margin:"0 0 4px", fontWeight:700 }}>{theme.footer_tagline}</p>
            {footerItems.filter(i => i.is_active).map(i => (
              <span key={i.id} style={{ marginRight:16 }}>{i.label}</span>
            ))}
          </div>
        </div>
      )}

      {/* Tab navigasyon */}
      <div style={{ display:"flex", gap:6, marginBottom:24 }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            style={{ padding:"8px 16px", borderRadius:8, border: tab===i ? "1px solid #c8a26b":"1px solid var(--adm-border)",
              background: tab===i ? "rgba(200,162,107,0.12)":"transparent",
              color: tab===i ? "#c8a26b":"var(--adm-text-muted)", cursor:"pointer", fontSize:13 }}>
            {t}
          </button>
        ))}
      </div>

      {/* Renkler */}
      {tab === 0 && (
        <div style={card}>
          <p style={{ fontSize:14, fontWeight:600, color:"var(--adm-text)", marginBottom:16 }}>Renk Paleti</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {[
              { key:"primary_color" as const, label:"Ana Renk (Kahve)" },
              { key:"secondary_color" as const, label:"İkinci Renk (Yeşil)" },
              { key:"accent_color" as const, label:"Vurgu Rengi (Şeftali)" },
              { key:"bg_color" as const, label:"Arkaplan" },
              { key:"text_color" as const, label:"Metin Rengi" },
            ].map(({ key, label: l }) => (
              <div key={key}>
                <label style={label}>{l}</label>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <input type="color" value={theme[key] as string} onChange={e => T(key, e.target.value)}
                    style={{ width:40, height:36, padding:2, borderRadius:6, border:"1px solid var(--adm-border)", background:"transparent", cursor:"pointer" }} />
                  <input style={{ ...input, flex:1 }} value={theme[key] as string}
                    onChange={e => T(key, e.target.value)} placeholder="#000000" />
                </div>
              </div>
            ))}
          </div>
          {/* Canlı önizleme renk bantı */}
          <div style={{ marginTop:20, borderRadius:8, overflow:"hidden", display:"flex", height:32 }}>
            {[theme.primary_color, theme.secondary_color, theme.accent_color, theme.bg_color, theme.text_color].map((c, i) => (
              <div key={i} style={{ flex:1, background:c }} title={c} />
            ))}
          </div>
        </div>
      )}

      {/* Fontlar */}
      {tab === 1 && (
        <div style={card}>
          <p style={{ fontSize:14, fontWeight:600, color:"var(--adm-text)", marginBottom:16 }}>Tipografi</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div>
              <label style={label}>Başlık Fontu</label>
              <select style={input} value={theme.font_heading} onChange={e => T("font_heading", e.target.value)}>
                {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <p style={{ marginTop:10, fontSize:24, color:"var(--adm-text)", fontFamily:theme.font_heading }}>Fındığın Rafine Hali</p>
            </div>
            <div>
              <label style={label}>Gövde Fontu</label>
              <select style={input} value={theme.font_body} onChange={e => T("font_body", e.target.value)}>
                {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <p style={{ marginTop:10, fontSize:14, color:"var(--adm-text-muted)", fontFamily:theme.font_body }}>Giresun fındığından üretilen doğal ürünler. %25 protein, gerçek lezzet.</p>
            </div>
          </div>
        </div>
      )}

      {/* Logo & Duyuru */}
      {tab === 2 && (
        <div>
          <div style={card}>
            <p style={{ fontSize:14, fontWeight:600, color:"var(--adm-text)", marginBottom:14 }}>Logo</p>
            <div style={{ display:"flex", gap:8, marginBottom:12 }}>
              <button
                type="button"
                onClick={() => logoFileRef.current?.click()}
                disabled={logoUploading}
                style={{ padding:"8px 16px", background:"#415D1F", color:"#fff", border:"none", borderRadius:6, fontSize:13, cursor:"pointer", opacity: logoUploading ? 0.6 : 1 }}
              >
                {logoUploading ? "Yükleniyor..." : "📁 Dosyadan Yükle"}
              </button>
              <input ref={logoFileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleLogoUpload} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={label}>Logo URL</label>
                <input style={input} value={theme.logo_url} onChange={e => T("logo_url", e.target.value)} placeholder="https://cdn.example.com/logo.svg" />
              </div>
              <div>
                <label style={label}>Genişlik (px)</label>
                <input type="number" style={input} value={theme.logo_width} onChange={e => T("logo_width", parseInt(e.target.value))} />
              </div>
            </div>
            {theme.logo_url && (
              <div style={{ marginTop:12, background:"var(--adm-bg)", borderRadius:8, padding:16, display:"inline-block" }}>
                <img src={theme.logo_url} alt="Logo önizleme" style={{ maxWidth:theme.logo_width, maxHeight:60, objectFit:"contain" }} />
              </div>
            )}
          </div>
          <div style={card}>
            <p style={{ fontSize:14, fontWeight:600, color:"var(--adm-text)", marginBottom:14 }}>Duyuru Çubuğu</p>
            <div style={{ display:"grid", gap:12 }}>
              <div>
                <label style={label}>Duyuru Metni</label>
                <input style={input} value={theme.announcement_text} onChange={e => T("announcement_text", e.target.value)} />
              </div>
              <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:"var(--adm-text-muted)" }}>
                <input type="checkbox" checked={theme.announcement_active} onChange={e => T("announcement_active", e.target.checked)} style={{ accentColor:"#c8a26b" }} />
                Duyuru çubuğunu göster
              </label>
            </div>
            {theme.announcement_active && (
              <div style={{ marginTop:10, background:theme.primary_color, color:theme.accent_color, padding:"8px 16px", borderRadius:6, fontSize:12, textAlign:"center" }}>
                {theme.announcement_text || "Duyuru metni burada görünür"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigasyon */}
      {tab === 3 && (
        <div style={card}>
          <NavEditor items={navItems} setItems={setNavItems} menu="header" />
        </div>
      )}

      {/* Footer */}
      {tab === 4 && (
        <div>
          <div style={card}>
            <p style={{ fontSize:14, fontWeight:600, color:"var(--adm-text)", marginBottom:14 }}>Footer Bilgileri</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                { key:"footer_tagline" as const, label:"Slogan", placeholder:"Fındığın rafine hali." },
                { key:"footer_email" as const, label:"İletişim E-postası", placeholder:"info@ventiate.com" },
                { key:"footer_phone" as const, label:"Telefon", placeholder:"+90 212 000 00 00" },
              ].map(({ key, label: l, placeholder }) => (
                <div key={key}>
                  <label style={label}>{l}</label>
                  <input style={input} value={theme[key] as string} onChange={e => T(key, e.target.value)} placeholder={placeholder} />
                </div>
              ))}
            </div>
          </div>
          <div style={card}>
            <p style={{ fontSize:14, fontWeight:600, color:"var(--adm-text)", marginBottom:14 }}>Sosyal Medya</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                { key:"instagram" as const, label:"Instagram URL" },
                { key:"facebook" as const, label:"Facebook URL" },
                { key:"twitter" as const, label:"Twitter / X URL" },
                { key:"tiktok" as const, label:"TikTok URL" },
              ].map(({ key, label: l }) => (
                <div key={key}>
                  <label style={label}>{l}</label>
                  <input style={input} value={theme[key] as string} onChange={e => T(key, e.target.value)} placeholder="https://..." />
                </div>
              ))}
            </div>
          </div>
          <div style={card}>
            <NavEditor items={footerItems} setItems={setFooterItems} menu="footer" />
          </div>
        </div>
      )}
    </div>
  );
}
