"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";


const NAV = [
  {
    section: "Genel",
    items: [
      { label: "Dashboard",   href: "/admin",             icon: <IconGrid />,   count: null },
      { label: "Analytics",   href: "/admin/analytics",   icon: <IconChart />,  count: null },
    ],
  },
  {
    section: "Katalog",
    items: [
      { label: "Ürünler",     href: "/admin/urunler",     icon: <IconBox />,    count: null },
      { label: "Siparişler",  href: "/admin/siparisler",  icon: <IconBag />,    count: "12" },
      { label: "Kuponlar",    href: "/admin/kuponlar",    icon: <IconTag />,    count: null },
    ],
  },
  {
    section: "İçerik",
    items: [
      { label: "İçerik & SEO", href: "/admin/icerik",   icon: <IconDoc />,    count: null },
    ],
  },
  {
    section: "Sistem",
    items: [
      { label: "Ayarlar",     href: "/admin/ayarlar",    icon: <IconGear />,   count: null },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--adm-bg)" }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? "var(--adm-sidebar-w)" : "52px",
        flexShrink: 0,
        background: "var(--adm-surface)",
        borderRight: "1px solid var(--adm-border)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s ease",
        overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{
          height: "var(--adm-header-h)",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          borderBottom: "1px solid var(--adm-border)",
          gap: "8px",
          flexShrink: 0,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, flexShrink: 0,
            background: "linear-gradient(135deg, var(--adm-accent) 0%, var(--adm-accent-2) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#000",
          }}>V</div>
          {sidebarOpen && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--adm-text)", lineHeight: 1.2 }}>Venti-Ate</div>
              <div style={{ fontSize: 10, color: "var(--adm-text-3)", marginTop: 1 }}>Admin Panel</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px 6px" }}>
          {NAV.map((group) => (
            <div key={group.section} style={{ marginBottom: 4 }}>
              {sidebarOpen && (
                <div className="adm-label" style={{ padding: "10px 6px 4px" }}>{group.section}</div>
              )}
              {!sidebarOpen && <div style={{ height: 12 }} />}
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`adm-nav-item${isActive(item.href) ? " active" : ""}`}
                  title={!sidebarOpen ? item.label : undefined}
                  style={!sidebarOpen ? { justifyContent: "center", padding: "7px" } : {}}
                >
                  <span className="adm-nav-icon">{item.icon}</span>
                  {sidebarOpen && <span style={{ flex: 1 }}>{item.label}</span>}
                  {sidebarOpen && item.count && (
                    <span className="adm-nav-count">{item.count}</span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        {sidebarOpen && (
          <div style={{ padding: "10px 12px", borderTop: "1px solid var(--adm-border)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="adm-live-dot" />
              <span style={{ fontSize: 11, color: "var(--adm-text-3)" }}>Canlı · {time}</span>
              <a href="/" target="_blank" style={{ marginLeft: "auto", fontSize: 11, color: "var(--adm-accent)", textDecoration: "none" }}>Siteye git →</a>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top header */}
        <header style={{
          height: "var(--adm-header-h)",
          borderBottom: "1px solid var(--adm-border)",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 12,
          flexShrink: 0,
          background: "var(--adm-surface)",
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="adm-btn adm-btn--ghost adm-btn--icon"
            title="Sidebar'ı gizle/göster"
          >
            <IconMenu />
          </button>
          <Breadcrumb pathname={pathname} />
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "var(--adm-accent-dim)",
              border: "1px solid rgba(200,162,107,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 600, color: "var(--adm-accent)",
            }}>M</div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const MAP: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/urunler": "Ürünler",
    "/admin/siparisler": "Siparişler",
    "/admin/kuponlar": "Kuponlar",
    "/admin/icerik": "İçerik & SEO",
    "/admin/ayarlar": "Ayarlar",
    "/admin/analytics": "Analytics",
  };
  const label = MAP[pathname] ?? "Admin";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--adm-text-3)" }}>
      <span>Admin</span>
      {label !== "Dashboard" && (
        <>
          <span style={{ opacity: 0.4 }}>/</span>
          <span style={{ color: "var(--adm-text)" }}>{label}</span>
        </>
      )}
    </div>
  );
}

// ── SVG Icons ─────────────────────────────────────────────
function IconGrid() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>;
}
function IconChart() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="1,12 5,7 9,9 15,3"/><line x1="15" y1="3" x2="15" y2="8"/><line x1="15" y1="3" x2="10" y2="3"/></svg>;
}
function IconBox() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z"/><line x1="8" y1="1" x2="8" y2="15"/><line x1="2" y1="4.5" x2="14" y2="4.5"/></svg>;
}
function IconBag() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4H14L13 14H3L2 4Z"/><path d="M5 4V3C5 1.9 6.3 1 8 1s3 .9 3 2v1"/></svg>;
}
function IconTag() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1H14V7L8 13 3 8 9 2 8 1Z"/><circle cx="11.5" cy="4.5" r="1"/></svg>;
}
function IconDoc() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="1" width="9" height="14" rx="1.5"/><path d="M11 1h1a2 2 0 012 2v9.5"/><line x1="5" y1="5" x2="9" y2="5"/><line x1="5" y1="8" x2="9" y2="8"/><line x1="5" y1="11" x2="7" y2="11"/></svg>;
}
function IconGear() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1 1M12 12l1 1M3 13l1-1M12 4l1-1"/></svg>;
}
function IconMenu() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/></svg>;
}
