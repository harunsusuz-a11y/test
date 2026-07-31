"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV = [
  {
    section: "Genel",
    items: [
      { label: "Dashboard",    href: "/admin",              icon: <IGrid />,   count: null },
      { label: "Analytics",   href: "/admin/analytics",    icon: <IChart />,  count: null },
    ],
  },
  {
    section: "Katalog",
    items: [
      { label: "Ürünler",     href: "/admin/urunler",      icon: <IBox />,    count: null },
      { label: "Kategoriler", href: "/admin/kategoriler",  icon: <IFolder />, count: null },
      { label: "Markalar",    href: "/admin/markalar",     icon: <IStar />,   count: null },
    ],
  },
  {
    section: "Satış",
    items: [
      { label: "Siparişler",  href: "/admin/siparisler",   icon: <IBag />,    count: null },
      { label: "Müşteriler",  href: "/admin/musteriler",   icon: <IUsers />,  count: null },
      { label: "İadeler",     href: "/admin/iadeler",      icon: <IReturn />, count: null },
    ],
  },
  {
    section: "Stok",
    items: [
      { label: "Envanter",    href: "/admin/envanter",     icon: <IBox2 />,   count: null },
      { label: "Depolar",     href: "/admin/depolar",      icon: <IWarehouse />, count: null },
    ],
  },
  {
    section: "Pazarlama",
    items: [
      { label: "Kampanyalar", href: "/admin/kampanyalar",  icon: <IBolt />,   count: null },
      { label: "Kuponlar",    href: "/admin/kuponlar",     icon: <ITag />,    count: null },
    ],
  },
  {
    section: "İçerik",
    items: [
      { label: "İçerik & SEO", href: "/admin/icerik",     icon: <IDoc />,    count: null },
      { label: "Medya",       href: "/admin/medya",        icon: <IImage />,  count: null },
      { label: "Bannerlar",   href: "/admin/bannerlar",    icon: <ILayout />, count: null },
    ],
  },
  {
    section: "Sistem",
    items: [
      { label: "Kullanıcılar", href: "/admin/kullanicilar", icon: <IShield />, count: null },
      { label: "Loglar",      href: "/admin/loglar",       icon: <IList />,   count: null },
      { label: "Ayarlar",     href: "/admin/ayarlar",      icon: <IGear />,   count: null },
    ],
  },
];

const ROUTE_LABELS: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/analytics": "Analytics",
  "/admin/urunler": "Ürünler",
  "/admin/kategoriler": "Kategoriler",
  "/admin/markalar": "Markalar",
  "/admin/siparisler": "Siparişler",
  "/admin/musteriler": "Müşteriler",
  "/admin/iadeler": "İadeler",
  "/admin/envanter": "Envanter",
  "/admin/depolar": "Depolar",
  "/admin/kampanyalar": "Kampanyalar",
  "/admin/kuponlar": "Kuponlar",
  "/admin/icerik": "İçerik & SEO",
  "/admin/medya": "Medya",
  "/admin/bannerlar": "Bannerlar",
  "/admin/kullanicilar": "Kullanıcılar",
  "/admin/loglar": "Loglar",
  "/admin/ayarlar": "Ayarlar",
};

export function AdminShell({ children, userEmail }: { children: React.ReactNode; userEmail?: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [time, setTime] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  async function handleSignOut() {
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
    <div className="adm-root" style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* ── Sidebar ── */}
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
                  {!collapsed && item.count && <span className="adm-nav-count">{item.count}</span>}
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

      {/* ── Main ── */}
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
            <Link href="/admin/loglar" className="adm-btn adm-btn--ghost adm-btn--icon" title="Bildirimler">
              <IBell />
            </Link>

            {/* Profile dropdown */}
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
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--adm-text)" }}>{userEmail}</div>
                      <div style={{ fontSize: 10, color: "var(--adm-text-4)" }}>Admin</div>
                    </div>
                    <Link href="/admin/ayarlar" className="adm-nav-item" style={{ fontSize: 12 }} onClick={() => setProfileOpen(false)}>
                      <span className="adm-nav-icon"><IGear /></span> Ayarlar
                    </Link>
                    <button
                      onClick={handleSignOut}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 9,
                        padding: "7px 10px", borderRadius: "var(--adm-r)",
                        color: "var(--adm-red)", fontSize: 12, background: "none",
                        border: "none", cursor: "pointer", fontFamily: "var(--adm-font)",
                      }}
                    >
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
  );
}

// Icons
function IGrid()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg> }
function IChart()     { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="1,13 5,8 9,10 15,3"/><polyline points="11,3 15,3 15,7"/></svg> }
function IBox()       { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1L14 4.5v7L8 15 2 11.5v-7L8 1z"/><line x1="8" y1="1" x2="8" y2="15"/><line x1="2" y1="4.5" x2="14" y2="4.5"/></svg> }
function IBox2()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="14" height="10" rx="1.5"/><path d="M5 4V3a3 3 0 016 0v1"/></svg> }
function IBag()       { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12l-1 10H3L2 4z"/><path d="M5 4V3a3 3 0 016 0v1"/></svg> }
function ITag()       { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2h6l6 6-6 6-6-6V2z"/><circle cx="5.5" cy="5.5" r="1"/></svg> }
function IDoc()       { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="1" width="10" height="14" rx="1.5"/><path d="M12 1h1a2 2 0 012 2v10"/><line x1="5" y1="5" x2="9" y2="5"/><line x1="5" y1="8" x2="9" y2="8"/><line x1="5" y1="11" x2="7" y2="11"/></svg> }
function IGear()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M3.2 12.8l1.1-1.1M11.7 4.3l1.1-1.1"/></svg> }
function IMenu()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="10" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/></svg> }
function IBell()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15"><path d="M8 1a5 5 0 015 5v3l1 2H2l1-2V6a5 5 0 015-5z"/><path d="M6 13a2 2 0 004 0"/></svg> }
function IFolder()    { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 3h5l2 2h7v9H1V3z"/></svg> }
function IStar()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7L8 1z"/></svg> }
function IUsers()     { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="5" r="3"/><path d="M1 14c0-3 2.2-5 5-5s5 2 5 5"/><circle cx="13" cy="5" r="2"/><path d="M13 9c1.5 0 3 1 3 3"/></svg> }
function IReturn()    { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8H13"/><path d="M7 4L3 8l4 4"/><path d="M13 4v8"/></svg> }
function IWarehouse() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 6L8 1l7 5v9H1V6z"/><rect x="5" y="9" width="6" height="6"/></svg> }
function IBolt()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 1L4 9h5l-2 6 7-8H9l2-6z"/></svg> }
function IImage()     { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="2" width="14" height="12" rx="1.5"/><circle cx="5.5" cy="6.5" r="1.5"/><path d="M1 12l4-4 3 3 2-2 5 5"/></svg> }
function ILayout()    { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="14" height="14" rx="1.5"/><line x1="1" y1="6" x2="15" y2="6"/><line x1="8" y1="6" x2="8" y2="15"/></svg> }
function IShield()    { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1l6 2.5V8c0 3.5-6 7-6 7S2 11.5 2 8V3.5L8 1z"/></svg> }
function IList()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="4" x2="14" y2="4"/><line x1="4" y1="8" x2="14" y2="8"/><line x1="4" y1="12" x2="14" y2="12"/><circle cx="1.5" cy="4" r="1"/><circle cx="1.5" cy="8" r="1"/><circle cx="1.5" cy="12" r="1"/></svg> }
function ILogout()    { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 14H2V2h4"/><path d="M11 11l3-3-3-3"/><line x1="14" y1="8" x2="6" y2="8"/></svg> }
