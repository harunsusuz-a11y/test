"use client";
import React, { useState } from "react";

const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem"];
const REVENUE = [1200, 1800, 2400, 1900, 3100, 2700, 4200];
const ORDERS =  [12,   18,   24,   19,   31,   27,   42];
const MAX_REV = Math.max(...REVENUE);
const MAX_ORD = Math.max(...ORDERS);

const TOP_PRODUCTS = [
  { name: "Tiramisu Fındıklı Bar", sales: 187, revenue: 7464.3, pct: 42 },
  { name: "Sade Fındık Kreması",   sales: 94,  revenue: 8920.6, pct: 32 },
  { name: "Kakao Fındıklı Bar",    sales: 61,  revenue: 2433.9, pct: 20 },
  { name: "Zeytinyağlı Krema",     sales: 18,  revenue: 1708.2, pct: 6  },
];

const TOP_PAGES = [
  { page: "/magaza",            views: 3842, bounce: "38%" },
  { page: "/urun/tiramisu-bar", views: 2119, bounce: "29%" },
  { page: "/",                  views: 1944, bounce: "44%" },
  { page: "/abonelik",          views: 876,  bounce: "51%" },
  { page: "/formunu-bul",       views: 654,  bounce: "62%" },
];

export default function AdminAnalytics() {
  const [metric, setMetric] = useState<"revenue" | "orders">("revenue");
  const data = metric === "revenue" ? REVENUE : ORDERS;
  const maxVal = metric === "revenue" ? MAX_REV : MAX_ORD;

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Analytics</div>
          <div className="adm-page-sub">Ocak — Temmuz 2026 · Demo veri</div>
        </div>
        <span className="adm-badge adm-badge--yellow">Demo Veri</span>
      </div>

      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Toplam Gelir",   value: "₺17.400",   change: "+38%", up: true },
          { label: "Toplam Sipariş", value: "173",        change: "+24%", up: true },
          { label: "Ort. Sipariş",   value: "₺100.6",    change: "+11%", up: true },
          { label: "Dönüşüm Oranı", value: "%3.2",       change: "-0.4%", up: false },
        ].map((k) => (
          <div className="adm-stat" key={k.label}>
            <div className="adm-stat__label">{k.label}</div>
            <div className="adm-stat__value">{k.value}</div>
            <div className={`adm-stat__change adm-stat__change--${k.up ? "up" : "down"}`}>{k.change}</div>
          </div>
        ))}
      </div>

      {/* Grafik */}
      <div className="adm-card" style={{ padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Aylık Trend</span>
          <div className="adm-tabs">
            <button className={`adm-tab${metric === "revenue" ? " active" : ""}`} onClick={() => setMetric("revenue")}>Gelir</button>
            <button className={`adm-tab${metric === "orders" ? " active" : ""}`} onClick={() => setMetric("orders")}>Sipariş</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 140 }}>
          {data.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
              <div style={{ fontSize: 9, color: "var(--adm-text-3)", fontWeight: 500 }}>
                {metric === "revenue" ? `₺${(v / 1000).toFixed(1)}k` : v}
              </div>
              <div style={{
                width: "100%",
                height: `${(v / maxVal) * 100}%`,
                background: i === data.length - 1
                  ? "var(--adm-accent)"
                  : "var(--adm-accent-dim)",
                borderRadius: "3px 3px 0 0",
                transition: "height 0.3s",
                cursor: "default",
                border: i === data.length - 1 ? "1px solid rgba(200,162,107,0.4)" : "none",
              }} />
              <div style={{ fontSize: 9, color: "var(--adm-text-3)" }}>{MONTHS[i]}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Top ürünler */}
        <div className="adm-card">
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--adm-border)", fontSize: 13, fontWeight: 600 }}>En Çok Satan Ürünler</div>
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {TOP_PRODUCTS.map((p) => (
              <div key={p.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: "var(--adm-text-3)" }}>{p.sales} adet · ₺{p.revenue.toLocaleString("tr-TR")}</span>
                </div>
                <div style={{ height: 4, background: "var(--adm-surface-3)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${p.pct}%`, background: "var(--adm-accent)", borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top sayfalar */}
        <div className="adm-card">
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--adm-border)", fontSize: 13, fontWeight: 600 }}>En Çok Ziyaret Edilen Sayfalar</div>
          <table className="adm-table">
            <thead><tr><th>Sayfa</th><th>Görüntülenme</th><th>Çıkış</th></tr></thead>
            <tbody>
              {TOP_PAGES.map((p) => (
                <tr key={p.page}>
                  <td><code style={{ fontFamily: "var(--adm-mono)", fontSize: 11, color: "var(--adm-accent)" }}>{p.page}</code></td>
                  <td style={{ fontWeight: 500 }}>{p.views.toLocaleString("tr-TR")}</td>
                  <td style={{ color: parseInt(p.bounce) > 50 ? "var(--adm-red)" : "var(--adm-text-2)" }}>{p.bounce}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
