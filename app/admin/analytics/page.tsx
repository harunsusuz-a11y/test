"use client";
import React, { useState } from "react";

const MONTHS = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
const REV    = [8200,9100,7800,11200,10400,12800,11600,13400,14200,12900,15600,18200];
const ORDERS = [41,46,39,56,52,64,58,67,71,65,78,91];
const TOP_PRODUCTS = [
  { name: "Tiramisu Fındıklı Protein Bar", sales: 134, revenue: 5342.60, pct: 38 },
  { name: "Sade Fındık Kreması",           sales:  87, revenue: 8256.30, pct: 62 },
  { name: "Kakao Fındıklı Protein Bar",    sales:  72, revenue: 2872.80, pct: 26 },
  { name: "Çikolatalı Fındık Kreması",     sales:  45, revenue: 4275.00, pct: 35 },
];
const CHANNELS = [
  { label: "Organik Arama", pct: 38, color: "var(--adm-accent)" },
  { label: "Doğrudan",      pct: 27, color: "var(--adm-blue)" },
  { label: "Sosyal Medya",  pct: 22, color: "var(--adm-purple)" },
  { label: "E-posta",       pct: 13, color: "var(--adm-green)" },
];

export default function AdminAnalytics() {
  const [period, setPeriod] = useState<"7g" | "30g" | "3a" | "1y">("1y");
  const maxRev = Math.max(...REV);

  const totalRev    = REV.reduce((s, v) => s + v, 0);
  const totalOrders = ORDERS.reduce((s, v) => s + v, 0);
  const avgOrder    = totalRev / totalOrders;
  const conv        = 3.8;

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Analytics</div>
          <div className="adm-page-sub">Performans ve satış metrikleri</div>
        </div>
        <div className="adm-tabs">
          {(["7g","30g","3a","1y"] as const).map(p => (
            <button key={p} className={`adm-tab${period === p ? " active" : ""}`} onClick={() => setPeriod(p)}>
              {p === "7g" ? "7 Gün" : p === "30g" ? "30 Gün" : p === "3a" ? "3 Ay" : "1 Yıl"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI */}
      <div className="adm-kpi-grid">
        <KCard label="Toplam Gelir"    value={`₺${(totalRev/1000).toFixed(1)}k`} change="+23%" up />
        <KCard label="Toplam Sipariş" value={String(totalOrders)} change="+18%" up />
        <KCard label="Ort. Sipariş"   value={`₺${avgOrder.toFixed(0)}`} change="+5%" up />
        <KCard label="Dönüşüm Oranı"  value={`%${conv}`} change="+0.4pp" up />
      </div>

      <div className="adm-grid-2" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Revenue Chart */}
        <div className="adm-card">
          <div className="adm-card-header">
            <span className="adm-card-title">Aylık Gelir</span>
            <span style={{ fontSize: 12, color: "var(--adm-text-3)" }}>₺{(totalRev/1000).toFixed(1)}k toplam</span>
          </div>
          <div style={{ padding: "16px 16px 12px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
              {REV.map((v, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 4 }}>
                  <div style={{
                    width: "100%", borderRadius: "3px 3px 0 0",
                    background: i === REV.length - 1 ? "var(--adm-accent)" : "var(--adm-surface-4)",
                    height: `${(v / maxRev) * 100}%`, minHeight: 3,
                    transition: "background 0.15s",
                    cursor: "pointer",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(200,162,107,0.7)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = i === REV.length - 1 ? "var(--adm-accent)" : "var(--adm-surface-4)"; }}
                    title={`₺${v.toLocaleString("tr-TR")}`}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              {MONTHS.map((m, i) => (
                <span key={i} style={{ fontSize: 9, color: "var(--adm-text-4)", flex: 1, textAlign: "center" }}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Channels */}
        <div className="adm-card">
          <div className="adm-card-header"><span className="adm-card-title">Trafik Kaynakları</span></div>
          <div style={{ padding: "16px" }}>
            {CHANNELS.map((ch, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: "var(--adm-text-2)" }}>{ch.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--adm-text)", fontFamily: "var(--adm-mono)" }}>%{ch.pct}</span>
                </div>
                <div style={{ height: 4, background: "var(--adm-surface-4)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${ch.pct}%`, background: ch.color, borderRadius: 2, transition: "width 0.6s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="adm-card">
        <div className="adm-card-header"><span className="adm-card-title">En Çok Satan Ürünler</span></div>
        <table className="adm-table">
          <thead>
            <tr><th>Ürün</th><th>Satış</th><th>Gelir</th><th>Pay</th></tr>
          </thead>
          <tbody>
            {TOP_PRODUCTS.map((p, i) => (
              <tr key={i}>
                <td className="adm-td--strong">{p.name}</td>
                <td style={{ fontFamily: "var(--adm-mono)" }}>{p.sales}</td>
                <td style={{ fontFamily: "var(--adm-mono)", color: "var(--adm-accent)" }}>₺{p.revenue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</td>
                <td style={{ minWidth: 120 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="adm-progress" style={{ flex: 1 }}>
                      <div className="adm-progress-bar" style={{ width: `${p.pct}%` }} />
                    </div>
                    <span style={{ fontSize: 10, color: "var(--adm-text-3)", minWidth: 28 }}>%{p.pct}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KCard({ label, value, change, up }: { label: string; value: string; change: string; up: boolean }) {
  return (
    <div className="adm-stat">
      <div className="adm-stat__label">{label}</div>
      <div className="adm-stat__value">{value}</div>
      <div style={{ height: 4 }} />
      <div className={`adm-stat__change adm-stat__change--${up ? "up" : "down"}`}>{change} bu dönem</div>
    </div>
  );
}
