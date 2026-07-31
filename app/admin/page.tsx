"use client";
import React, { useState } from "react";
import Link from "next/link";
import { products } from "@/content/products";
import { demoCoupons } from "@/content/discounts";

// Demo sipariş verisi
const DEMO_ORDERS = [
  { id: "#1024", customer: "E. Kaya",     product: "Tiramisu Bar × 3",     total: 119.7, status: "kargoda",     date: "31 Tem" },
  { id: "#1023", customer: "M. Tunç",     product: "Fındık Kreması × 2",   total: 189.8, status: "teslim",     date: "30 Tem" },
  { id: "#1022", customer: "A. Şahin",    product: "Bar + Krema Paketi",   total: 229.5, status: "hazırlanıyor", date: "30 Tem" },
  { id: "#1021", customer: "D. Çelik",    product: "Tiramisu Bar × 5",     total: 199.5, status: "iptal",      date: "29 Tem" },
  { id: "#1020", customer: "S. Yıldız",   product: "Kakao Bar × 2",        total: 79.8,  status: "teslim",    date: "29 Tem" },
];

const WEEK_BARS = [22, 38, 31, 45, 28, 52, 41];

const STATUS_MAP: Record<string, string> = {
  kargoda: "adm-badge--blue",
  teslim: "adm-badge--green",
  hazırlanıyor: "adm-badge--yellow",
  iptal: "adm-badge--red",
};

export default function AdminDashboard() {
  const totalRevenue = DEMO_ORDERS.filter(o => o.status !== "iptal").reduce((s, o) => s + o.total, 0);

  return (
    <div>
      {/* Header */}
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Dashboard</div>
          <div className="adm-page-sub">Temmuz 2026 · Son güncelleme: az önce</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/admin/siparisler" className="adm-btn adm-btn--secondary">
            Tüm siparişler
          </Link>
          <Link href="/admin/urunler" className="adm-btn adm-btn--primary">
            + Ürün ekle
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard
          label="Bu ay gelir"
          value={`₺${totalRevenue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`}
          change="+18%"
          up
          bars={WEEK_BARS}
        />
        <StatCard
          label="Toplam sipariş"
          value="47"
          change="+12%"
          up
        />
        <StatCard
          label="Aktif ürün"
          value={String(products.length)}
          change="—"
          up={false}
        />
        <StatCard
          label="Aktif kupon"
          value={String(demoCoupons.length)}
          change="VENTI10 aktif"
          up
        />
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        {/* Son siparişler */}
        <div className="adm-card">
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--adm-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Son Siparişler</span>
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
                  <td><span style={{ fontFamily: "var(--adm-mono)", fontSize: 12, color: "var(--adm-accent)" }}>{o.id}</span></td>
                  <td style={{ color: "var(--adm-text-2)" }}>{o.customer}</td>
                  <td style={{ color: "var(--adm-text-2)", maxWidth: 160 }}>{o.product}</td>
                  <td style={{ fontWeight: 500 }}>₺{o.total.toFixed(2)}</td>
                  <td><span className={`adm-badge ${STATUS_MAP[o.status]}`}>{o.status}</span></td>
                  <td style={{ color: "var(--adm-text-3)" }}>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sağ panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Hızlı linkler */}
          <div className="adm-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Hızlı Erişim</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { label: "Yeni ürün ekle", href: "/admin/urunler", dot: "var(--adm-accent)" },
                { label: "Sipariş yönet", href: "/admin/siparisler", dot: "var(--adm-blue)" },
                { label: "Kupon oluştur", href: "/admin/kuponlar", dot: "var(--adm-green)" },
                { label: "İçerik düzenle", href: "/admin/icerik", dot: "var(--adm-yellow)" },
                { label: "Ayarlar", href: "/admin/ayarlar", dot: "var(--adm-text-4)" },
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
                  {l.label}
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--adm-text-4)" }}>→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Ürün özeti */}
          <div className="adm-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Ürün Özeti</div>
            {products.slice(0, 4).map((p) => (
              <div key={p.slug} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 0", borderBottom: "1px solid var(--adm-border)",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 4,
                  background: "var(--adm-surface-3)",
                  flexShrink: 0, overflow: "hidden",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: "var(--adm-text-3)" }}>₺{p.price}</div>
                </div>
                <span className="adm-badge adm-badge--green" style={{ fontSize: 9 }}>aktif</span>
              </div>
            ))}
            <Link href="/admin/urunler" className="adm-btn adm-btn--ghost adm-btn--sm" style={{ marginTop: 8, width: "100%", justifyContent: "center" }}>
              Tüm ürünler ({products.length})
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, up, bars }: {
  label: string; value: string; change: string; up: boolean; bars?: number[];
}) {
  return (
    <div className="adm-stat">
      <div className="adm-stat__label">{label}</div>
      <div className="adm-stat__value">{value}</div>
      {bars && (
        <div className="adm-chart-area" style={{ height: 40, padding: "4px 0" }}>
          {bars.map((h, i) => (
            <div key={i} className={`adm-bar${i === bars.length - 1 ? " adm-bar--active" : ""}`} style={{ height: `${(h / 60) * 100}%` }} />
          ))}
        </div>
      )}
      <div className={`adm-stat__change adm-stat__change--${up ? "up" : "down"}`}>{change}</div>
    </div>
  );
}
