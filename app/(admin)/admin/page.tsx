"use client";
import React, { useState } from "react";
import Link from "next/link";
import { products } from "@/content/products";
import { demoCoupons } from "@/content/discounts";

const DEMO_ORDERS = [
  { id: "#1024", customer: "Elif Kaya",     product: "Tiramisu Bar × 3",     total: 119.70, status: "kargoda",      date: "31 Tem" },
  { id: "#1023", customer: "Mehmet Tunç",   product: "Fındık Kreması × 2",   total: 189.80, status: "teslim",      date: "30 Tem" },
  { id: "#1022", customer: "Ayşe Şahin",   product: "Bar + Krema Paketi",   total: 229.50, status: "hazırlanıyor",date: "30 Tem" },
  { id: "#1021", customer: "Derya Çelik",  product: "Tiramisu Bar × 5",     total: 199.50, status: "iptal",       date: "29 Tem" },
  { id: "#1020", customer: "Selin Yıldız", product: "Kakao Bar × 2",        total:  79.80, status: "teslim",      date: "29 Tem" },
];

const WEEK = [22, 38, 31, 45, 28, 52, 41];
const MONTH_REVENUE = [180, 220, 195, 310, 285, 340, 290, 380, 420, 395, 460, 520, 490, 580];

const STATUS: Record<string, string> = {
  kargoda:      "adm-badge--blue",
  teslim:       "adm-badge--green",
  hazırlanıyor: "adm-badge--yellow",
  iptal:        "adm-badge--red",
};

const ACTIVITIES = [
  { text: "Yeni sipariş geldi", sub: "#1024 · Elif Kaya", time: "2 dk", color: "var(--adm-blue)" },
  { text: "Ürün stok uyarısı", sub: "Kakao Bar — düşük stok", time: "18 dk", color: "var(--adm-yellow)" },
  { text: "Sipariş teslim edildi", sub: "#1020 · Selin Yıldız", time: "1 sa", color: "var(--adm-green)" },
  { text: "Kupon kullanıldı", sub: "VENTI10 · 5 kullanım", time: "3 sa", color: "var(--adm-accent)" },
];

export default function AdminDashboard() {
  const revenue = DEMO_ORDERS.filter(o => o.status !== "iptal").reduce((s, o) => s + o.total, 0);
  const maxBar = Math.max(...MONTH_REVENUE);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Dashboard</div>
          <div className="adm-page-sub">Temmuz 2026 · Son güncelleme: az önce</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/admin/siparisler" className="adm-btn adm-btn--secondary">Siparişler</Link>
          <Link href="/admin/urunler"    className="adm-btn adm-btn--primary">+ Ürün Ekle</Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="adm-kpi-grid">
        <KpiCard
          label="Bu Ay Gelir"
          value={`₺${revenue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`}
          change="+18%" up
          bars={WEEK}
          accent
        />
        <KpiCard label="Toplam Sipariş" value="47"  change="+12%" up />
        <KpiCard label="Aktif Ürün"     value={String(products.length)} change="—" />
        <KpiCard label="Aktif Kupon"    value={String(demoCoupons.length)} change="VENTI10" up />
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Revenue Chart */}
          <div className="adm-card">
            <div className="adm-card-header">
              <span className="adm-card-title">Gelir Trendi</span>
              <span className="adm-badge adm-badge--green" style={{ fontSize: 10 }}>↑ Bu ay</span>
            </div>
            <div style={{ padding: "16px 16px 12px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
                {MONTH_REVENUE.map((v, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${(v / maxBar) * 100}%`,
                      background: hoveredBar === i ? "var(--adm-accent)" : i === MONTH_REVENUE.length - 1 ? "rgba(200,162,107,0.6)" : "var(--adm-surface-4)",
                      borderRadius: "2px 2px 0 0",
                      cursor: "pointer",
                      transition: "background 0.1s, height 0.2s",
                      minHeight: 3,
                      position: "relative",
                    }}
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                    title={`₺${v}`}
                  />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                {["Oca", "Mar", "May", "Tem"].map(m => (
                  <span key={m} style={{ fontSize: 10, color: "var(--adm-text-4)" }}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Son Siparişler */}
          <div className="adm-card">
            <div className="adm-card-header">
              <span className="adm-card-title">Son Siparişler</span>
              <Link href="/admin/siparisler" className="adm-btn adm-btn--ghost adm-btn--sm">Tümünü gör →</Link>
            </div>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Sipariş</th>
                  <th>Müşteri</th>
                  <th>Ürün</th>
                  <th>Toplam</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_ORDERS.map((o) => (
                  <tr key={o.id}>
                    <td className="adm-td--mono">{o.id}</td>
                    <td className="adm-td--strong">{o.customer}</td>
                    <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.product}</td>
                    <td className="adm-td--strong">₺{o.total.toFixed(2)}</td>
                    <td><span className={`adm-badge ${STATUS[o.status]}`}>{o.status}</span></td>
                    <td className="adm-text-muted">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Activity Feed */}
          <div className="adm-card">
            <div className="adm-card-header">
              <span className="adm-card-title">Aktivite</span>
              <div className="adm-live-dot" />
            </div>
            <div style={{ padding: "8px 0" }}>
              {ACTIVITIES.map((a, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "9px 14px",
                  borderBottom: i < ACTIVITIES.length - 1 ? "1px solid var(--adm-border)" : "none",
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: a.color, flexShrink: 0, marginTop: 5,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "var(--adm-text-2)" }}>{a.text}</div>
                    <div style={{ fontSize: 11, color: "var(--adm-text-3)", marginTop: 1 }}>{a.sub}</div>
                  </div>
                  <span style={{ fontSize: 10, color: "var(--adm-text-4)", flexShrink: 0 }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hızlı Erişim */}
          <div className="adm-card">
            <div className="adm-card-header"><span className="adm-card-title">Hızlı Erişim</span></div>
            <div style={{ padding: "8px 8px" }}>
              {[
                { label: "Yeni ürün ekle",   href: "/admin/urunler",    dot: "var(--adm-accent)", badge: null },
                { label: "Sipariş yönet",    href: "/admin/siparisler", dot: "var(--adm-blue)",   badge: "5" },
                { label: "Kupon oluştur",    href: "/admin/kuponlar",   dot: "var(--adm-green)",  badge: null },
                { label: "İçerik düzenle",   href: "/admin/icerik",     dot: "var(--adm-purple)", badge: null },
                { label: "Ayarlar",          href: "/admin/ayarlar",    dot: "var(--adm-text-4)", badge: null },
              ].map((l) => (
                <Link key={l.href} href={l.href} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 8px", borderRadius: 5,
                  color: "var(--adm-text-2)", textDecoration: "none", fontSize: 12,
                  transition: "background 0.1s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--adm-surface-2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: l.dot, flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{l.label}</span>
                  {l.badge && <span className="adm-nav-count" style={{ fontSize: 9 }}>{l.badge}</span>}
                  <span style={{ fontSize: 11, color: "var(--adm-text-4)" }}>→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Ürün Özeti */}
          <div className="adm-card">
            <div className="adm-card-header"><span className="adm-card-title">Ürünler</span></div>
            <div style={{ padding: "8px 0" }}>
              {products.slice(0, 5).map((p, i) => (
                <div key={p.slug} style={{
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "8px 14px",
                  borderBottom: i < 4 ? "1px solid var(--adm-border)" : "none",
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 5,
                    background: "var(--adm-surface-3)",
                    flexShrink: 0, overflow: "hidden",
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "var(--adm-text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: "var(--adm-text-3)", fontFamily: "var(--adm-mono)" }}>₺{p.price}</div>
                  </div>
                  <span className="adm-badge adm-badge--green" style={{ fontSize: 9 }}>aktif</span>
                </div>
              ))}
            </div>
            <div style={{ padding: "10px 14px", borderTop: "1px solid var(--adm-border)" }}>
              <Link href="/admin/urunler" className="adm-btn adm-btn--ghost adm-btn--sm" style={{ width: "100%", justifyContent: "center" }}>
                Tüm ürünler ({products.length}) →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, change, up, bars, accent }: {
  label: string; value: string; change: string; up?: boolean; bars?: number[]; accent?: boolean;
}) {
  const maxH = bars ? Math.max(...bars) : 1;
  return (
    <div className="adm-stat" style={accent ? { borderColor: "rgba(200,162,107,0.2)" } : {}}>
      <div className="adm-stat__label">{label}</div>
      <div className="adm-stat__value">{value}</div>
      {bars && (
        <div className="adm-chart-area" style={{ height: 36, margin: "8px 0 6px" }}>
          {bars.map((h, i) => (
            <div
              key={i}
              className={`adm-bar${i === bars.length - 1 ? " adm-bar--active" : ""}`}
              style={{ height: `${(h / maxH) * 100}%` }}
            />
          ))}
        </div>
      )}
      {!bars && <div style={{ height: 6 }} />}
      <div className={`adm-stat__change adm-stat__change--${up ? "up" : change === "—" ? "flat" : "flat"}`}>
        {change}
      </div>
    </div>
  );
}
