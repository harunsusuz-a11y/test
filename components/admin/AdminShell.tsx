"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { section: "Genel", items: [
    { label: "Dashboard",     href: "/admin",              icon: <IGrid /> },
    { label: "Analytics",    href: "/admin/analytics",    icon: <IChart /> },
  ]},
  { section: "Katalog", items: [
    { label: "Ürünler",      href: "/admin/urunler",      icon: <IBox /> },
    { label: "Kategoriler",  href: "/admin/kategoriler",  icon: <IFolder /> },
    { label: "Markalar",     href: "/admin/markalar",     icon: <IStar /> },
  ]},
  { section: "Satış", items: [
    { label: "Siparişler",   href: "/admin/siparisler",   icon: <IBag /> },
    { label: "Müşteriler",   href: "/admin/musteriler",   icon: <IUsers /> },
    { label: "İadeler",      href: "/admin/iadeler",      icon: <IReturn /> },
    { label: "Yorumlar",     href: "/admin/yorumlar",     icon: <IStar2 /> },
    { label: "Soru-Cevap",   href: "/admin/sorucevap",   icon: <IMsg /> },
    { label: "Kargo",        href: "/admin/kargo",        icon: <IShip /> },
  ]},
  { section: "Stok", items: [
    { label: "Envanter",     href: "/admin/envanter",     icon: <IBox2 /> },
    { label: "Depolar",      href: "/admin/depolar",      icon: <IWarehouse /> },
    { label: "Tedarikçiler", href: "/admin/tedarikciler", icon: <ITruck /> },
    { label: "Satın Alma",   href: "/admin/satin-alma",   icon: <ICart /> },
  ]},
  { section: "Pazarlama", items: [
    { label: "Kampanyalar",  href: "/admin/kampanyalar",  icon: <IBolt /> },
    { label: "Kuponlar",     href: "/admin/kuponlar",     icon: <ITag /> },
  ]},
  { section: "İçerik", items: [
    { label: "İçerik & SEO", href: "/admin/icerik",      icon: <IDoc /> },
    { label: "Medya",        href: "/admin/medya",        icon: <IImage /> },
    { label: "Bannerlar",    href: "/admin/bannerlar",    icon: <ILayout /> },
    { label: "Bülten",      href: "/admin/bulten",       icon: <IMail /> },
    { label: "Menüler",      href: "/admin/menuler",      icon: <INav /> },
    { label: "Şablonlar",    href: "/admin/sablonlar",    icon: <ITemplate /> },
    { label: "Yönlendirme", href: "/admin/yonlendirmeler",icon: <ILink /> },
  ]},
  { section: "Sistem", items: [
    { label: "Kullanıcılar", href: "/admin/kullanicilar", icon: <IShield /> },
    { label: "Ödemeler",     href: "/admin/odemeler",     icon: <ICard /> },
    { label: "Finans",       href: "/admin/finans",       icon: <IFinance /> },
    { label: "Raporlar",     href: "/admin/raporlar",     icon: <IReport /> },
    { label: "Aramalar",     href: "/admin/aramalar",     icon: <ISearch2 /> },
    { label: "Bildirimler",  href: "/admin/bildirimler",  icon: <IBell /> },
    { label: "Webhooks",     href: "/admin/webhooks",     icon: <IZap /> },
    { label: "Entegrasyonlar",href: "/admin/entegrasyonlar",icon: <IPlug /> },
    { label: "Loglar",       href: "/admin/loglar",       icon: <IList /> },
    { label: "Ayarlar",      href: "/admin/ayarlar",      icon: <IGear /> },
  ]},
];

const ROUTE_LABELS: Record<string, string> = {
  "/admin": "Dashboard", "/admin/analytics": "Analytics",
  "/admin/urunler": "Ürünler", "/admin/kategoriler": "Kategoriler",
  "/admin/markalar": "Markalar", "/admin/siparisler": "Siparişler",
  "/admin/musteriler": "Müşteriler", "/admin/iadeler": "İadeler",
  "/admin/envanter": "Envanter", "/admin/depolar": "Depolar",
  "/admin/kampanyalar": "Kampanyalar", "/admin/kuponlar": "Kuponlar",
  "/admin/icerik": "İçerik & SEO", "/admin/medya": "Medya",
  "/admin/bannerlar": "Bannerlar", "/admin/kullanicilar": "Kullanıcılar",
  "/admin/loglar": "Loglar",
  "/admin/tedarikciler": "Tedarikçiler",
  "/admin/satin-alma": "Satın Alma",
  "/admin/kargo": "Kargo Yönetimi",
  "/admin/bulten": "Bülten Aboneleri",
  "/admin/yonlendirmeler": "URL Yönlendirmeleri",
  "/admin/yorumlar": "Yorumlar",
  "/admin/ayarlar": "Ayarlar",
};

function applyAdminTheme(theme: "dark"|"light") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "light") {
    root.style.setProperty("--adm-bg", "#f0f0f3");
    root.style.setProperty("--adm-surface", "#ffffff");
    root.style.setProperty("--adm-text", "#111118");
    root.style.setProperty("--adm-text-muted", "#6b6b76");
    root.style.setProperty("--adm-border", "rgba(0,0,0,0.08)");
  } else {
    root.style.setProperty("--adm-bg", "#0a0a0d");
    root.style.setProperty("--adm-surface", "#1a1a1f");
    root.style.setProperty("--adm-text", "#f2f2f3");
    root.style.setProperty("--adm-text-muted", "#9b9ba4");
    root.style.setProperty("--adm-border", "rgba(255,255,255,0.08)");
  }
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [time, setTime] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark"|"light">("dark");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = (localStorage.getItem("admin-theme") ?? "dark") as "dark"|"light";
    setTheme(stored);
    applyAdminTheme(stored);
  }, []);

  function toggleTheme() {
    const next: "dark"|"light" = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof window !== "undefined") localStorage.setItem("admin-theme", next);
    applyAdminTheme(next);
  }





  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserEmail(data.user.email ?? "");
    });
  }, []);

  const [newOrders, setNewOrders] = useState(0);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => {
        setNewOrders(n => n + 1);
        setShowNotif(true);
        setTimeout(() => setShowNotif(false), 4000);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/giris");
    router.refresh();
  }

  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  const pageLabel = ROUTE_LABELS[pathname] ?? "Admin";
  const initials = userEmail ? userEmail[0].toUpperCase() : "A";

  return (
    <>
    {showNotif && (
      <div style={{
        position:"fixed", bottom:20, right:20, zIndex:200,
        background:"var(--adm-surface)", border:"1px solid var(--adm-accent)",
        borderRadius:"var(--adm-r-lg)", padding:"12px 16px",
        boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
        display:"flex", alignItems:"center", gap:10,
        animation:"adm-slide-up 0.2s ease",
      }}>
        <div className="adm-live-dot" />
        <div>
          <div style={{ fontSize:12, fontWeight:600, color:"var(--adm-text)" }}>Yeni Sipariş!</div>
          <div style={{ fontSize:11, color:"var(--adm-text-3)" }}>{newOrders} yeni sipariş bekleniyor</div>
        </div>
        <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={()=>setShowNotif(false)}>✕</button>
      </div>
    )}
    <div className="adm-root" style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside className={`adm-sidebar${collapsed ? " adm-sidebar--collapsed" : ""}`}>
        <div className="adm-sidebar-logo">
          <div className="adm-logo-mark">V</div>
          {!collapsed && (
            <div className="adm-logo-text">
              <div className="adm-logo-text__name">Venti-Ate</div>
              <div className="adm-logo-text__sub">Admin Panel</div>
            </div>
          )}
        </div>

        <nav className="adm-nav">
          {NAV.map((group) => (
            <div key={group.section} className="adm-nav-section">
              {!collapsed && <span className="adm-nav-section-label">{group.section}</span>}
              {collapsed && <div style={{ height: 8 }} />}
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`adm-nav-item${isActive(item.href) ? " active" : ""}`}
                  title={collapsed ? item.label : undefined}
                  style={collapsed ? { justifyContent: "center", padding: "8px" } : {}}
                >
                  <span className="adm-nav-icon">{item.icon}</span>
                  {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {!collapsed && (
          <div className="adm-sidebar-footer">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="adm-live-dot" />
              <span className="adm-text-sm adm-text-muted">Canlı · {time}</span>
              <a href="/" target="_blank" className="adm-ml-auto adm-text-sm adm-text-accent" style={{ textDecoration: "none" }}>Site ↗</a>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header className="adm-header">
          <button onClick={() => setCollapsed(!collapsed)} className="adm-btn adm-btn--ghost adm-btn--icon">
            <IMenu />
          </button>
          <div className="adm-breadcrumb">
            <span>Admin</span>
            {pageLabel !== "Dashboard" && (
              <>
                <span className="adm-breadcrumb__sep">/</span>
                <span className="adm-breadcrumb__current">{pageLabel}</span>
              </>
            )}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
              style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"6px 10px", color:"#9b9ba4", cursor:"pointer", fontSize:14, lineHeight:1 }}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <div style={{ position: "relative" }}>
              <div
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: "var(--adm-accent-dim)",
                  border: "1px solid rgba(200,162,107,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "var(--adm-accent)",
                  cursor: "pointer",
                }}
              >{initials}</div>

              {profileOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setProfileOpen(false)} />
                  <div style={{
                    position: "absolute", right: 0, top: 36,
                    background: "var(--adm-surface)", border: "1px solid var(--adm-border-2)",
                    borderRadius: "var(--adm-r-lg)", padding: "6px",
                    width: 200, zIndex: 51,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  }}>
                    <div style={{ padding: "8px 10px 10px", borderBottom: "1px solid var(--adm-border)", marginBottom: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--adm-text)", overflow: "hidden", textOverflow: "ellipsis" }}>{userEmail}</div>
                      <div style={{ fontSize: 10, color: "var(--adm-text-4)" }}>Super Admin</div>
                    </div>
                    <Link href="/admin/ayarlar" className="adm-nav-item" style={{ fontSize: 12 }} onClick={() => setProfileOpen(false)}>
                      <span className="adm-nav-icon"><IGear /></span> Ayarlar
                    </Link>
                    <button onClick={handleSignOut} style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 9,
                      padding: "7px 10px", borderRadius: "var(--adm-r)",
                      color: "var(--adm-red)", fontSize: 12, background: "none",
                      border: "none", cursor: "pointer", fontFamily: "var(--adm-font)",
                    }}>
                      <span className="adm-nav-icon" style={{ opacity: 1 }}><ILogout /></span> Çıkış Yap
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {children}
        </main>
      </div>
    </div>
    </>
  );
}

function IGrid()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg> }
function IChart()     { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="1,13 5,8 9,10 15,3"/><polyline points="11,3 15,3 15,7"/></svg> }
function IBox()       { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1L14 4.5v7L8 15 2 11.5v-7L8 1z"/><line x1="8" y1="1" x2="8" y2="15"/><line x1="2" y1="4.5" x2="14" y2="4.5"/></svg> }
function IBox2()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="14" height="10" rx="1.5"/><path d="M5 4V3a3 3 0 016 0v1"/></svg> }
function IBag()       { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12l-1 10H3L2 4z"/><path d="M5 4V3a3 3 0 016 0v1"/></svg> }
function ITag()       { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2h6l6 6-6 6-6-6V2z"/><circle cx="5.5" cy="5.5" r="1"/></svg> }
function IDoc()       { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="1" width="10" height="14" rx="1.5"/><line x1="5" y1="5" x2="9" y2="5"/><line x1="5" y1="8" x2="9" y2="8"/><line x1="5" y1="11" x2="7" y2="11"/></svg> }
function IGear()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M3.2 12.8l1.1-1.1M11.7 4.3l1.1-1.1"/></svg> }
function IMenu()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="10" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/></svg> }
function IFolder()    { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 3h5l2 2h7v9H1V3z"/></svg> }
function IStar()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7L8 1z"/></svg> }
function IUsers()     { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="5" r="3"/><path d="M1 14c0-3 2.2-5 5-5s5 2 5 5"/><circle cx="13" cy="5" r="2"/><path d="M13 9c1.5 0 3 1 3 3"/></svg> }
function IReturn()    { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8H13"/><path d="M7 4L3 8l4 4"/><path d="M13 4v8"/></svg> }
function IWarehouse() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 6L8 1l7 5v9H1V6z"/><rect x="5" y="9" width="6" height="6"/></svg> }
function IBolt()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 1L4 9h5l-2 6 7-8H9l2-6z"/></svg> }
function IImage()     { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="2" width="14" height="12" rx="1.5"/><circle cx="5.5" cy="6.5" r="1.5"/><path d="M1 12l4-4 3 3 2-2 5 5"/></svg> }
function ILayout()    { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="14" height="14" rx="1.5"/><line x1="1" y1="6" x2="15" y2="6"/><line x1="8" y1="6" x2="8" y2="15"/></svg> }
function IShield()    { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1l6 2.5V8c0 3.5-6 7-6 7S2 11.5 2 8V3.5L8 1z"/></svg> }
function IMsg() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function INav() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }
function ITemplate() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>; }
function ICard() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>; }
function IFinance() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>; }
function IReport() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>; }
function ISearch2() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function IBell() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }
function IZap() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>; }
function IPlug() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>; }
function IList()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="4" x2="14" y2="4"/><line x1="4" y1="8" x2="14" y2="8"/><line x1="4" y1="12" x2="14" y2="12"/><circle cx="1.5" cy="4" r="1"/><circle cx="1.5" cy="8" r="1"/><circle cx="1.5" cy="12" r="1"/></svg> }
function IMail()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="14" height="10" rx="1.5"/><path d="M1 4l7 5 7-5"/></svg>; }
function ILink()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 9a3 3 0 004.24 0l2-2a3 3 0 00-4.24-4.24L8 3.76"/><path d="M9 7a3 3 0 00-4.24 0l-2 2a3 3 0 004.24 4.24L8 12.24"/></svg>; }
function IStar2()     { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1l1.4 4.2H14l-3.7 2.7 1.4 4.3L8 9.5l-3.7 2.7 1.4-4.3L2 5.2h4.6L8 1z"/></svg>; }
function ICart()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1h2l2 8h8l1-5H5"/><circle cx="7" cy="13" r="1.5"/><circle cx="12" cy="13" r="1.5"/></svg>; }
function IShip()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 10l2-6h8l2 6"/><path d="M1 10h14v2a2 2 0 01-14 0v-2z"/><line x1="8" y1="4" x2="8" y2="10"/></svg>; }
function ITruck()     { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="5" width="10" height="8" rx="1"/><path d="M11 7h2l2 3v3h-4V7z"/><circle cx="4" cy="14" r="1.5"/><circle cx="12" cy="14" r="1.5"/></svg>; }
function ILogout()    { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 14H2V2h4"/><path d="M11 11l3-3-3-3"/><line x1="14" y1="8" x2="6" y2="8"/></svg> }
