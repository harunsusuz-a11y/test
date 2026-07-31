"use client";
import React, { useState } from "react";

type OrderStatus = "hazırlanıyor" | "kargoda" | "teslim" | "iptal";

type Order = {
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: OrderStatus;
  date: string;
  note?: string;
};

const DEMO_ORDERS: Order[] = [
  {
    id: "#1024", customer: "Elif Kaya", email: "elif@example.com", phone: "0532 111 22 33",
    address: "Bağcılar Mah. No:12/4, Bursa",
    items: [{ name: "Tiramisu Fındıklı Protein Bar", qty: 3, price: 39.9 }],
    total: 119.7, status: "kargoda", date: "31 Tem 2026", note: "Kapıda zil çalma",
  },
  {
    id: "#1023", customer: "Mehmet Tunç", email: "mtunc@example.com", phone: "0541 222 33 44",
    address: "Çankaya, Ankara",
    items: [{ name: "Sade Fındık Kreması", qty: 2, price: 94.9 }],
    total: 189.8, status: "teslim", date: "30 Tem 2026",
  },
  {
    id: "#1022", customer: "Ayşe Şahin", email: "aysesahin@example.com", phone: "0555 333 44 55",
    address: "Kadıköy, İstanbul",
    items: [
      { name: "Tiramisu Bar", qty: 2, price: 39.9 },
      { name: "Fındık Kreması", qty: 1, price: 94.9 },
    ],
    total: 229.5, status: "hazırlanıyor", date: "30 Tem 2026",
  },
  {
    id: "#1021", customer: "Deniz Çelik", email: "dcelik@example.com", phone: "0506 444 55 66",
    address: "Konak, İzmir",
    items: [{ name: "Tiramisu Bar", qty: 5, price: 39.9 }],
    total: 199.5, status: "iptal", date: "29 Tem 2026", note: "Müşteri iptal etti",
  },
  {
    id: "#1020", customer: "Selin Yıldız", email: "selin@example.com", phone: "0533 555 66 77",
    address: "Nilüfer, Bursa",
    items: [{ name: "Kakao Fındıklı Bar", qty: 2, price: 39.9 }],
    total: 79.8, status: "teslim", date: "29 Tem 2026",
  },
  {
    id: "#1019", customer: "Burak Arslan", email: "barslan@example.com", phone: "0545 666 77 88",
    address: "Pendik, İstanbul",
    items: [{ name: "Fındık Kreması", qty: 1, price: 94.9 }],
    total: 124.8, status: "kargoda", date: "28 Tem 2026",
  },
];

const STATUS_MAP: Record<OrderStatus, string> = {
  kargoda: "adm-badge--blue",
  teslim: "adm-badge--green",
  hazırlanıyor: "adm-badge--yellow",
  iptal: "adm-badge--red",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  hazırlanıyor: "Hazırlanıyor",
  kargoda: "Kargoda",
  teslim: "Teslim Edildi",
  iptal: "İptal",
};

export default function AdminSiparisler() {
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "tümü">("tümü");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "tümü" || o.status === statusFilter;
    const matchSearch = o.id.includes(search) || o.customer.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  function updateStatus(id: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    if (selected?.id === id) setSelected((s) => s ? { ...s, status } : s);
  }

  return (
    <div style={{ display: "flex", gap: 16, height: "calc(100vh - 52px - 48px)" }}>
      {/* Sol liste */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="adm-page-header">
          <div>
            <div className="adm-page-title">Siparişler</div>
            <div className="adm-page-sub">{orders.length} toplam sipariş</div>
          </div>
          <button className="adm-btn adm-btn--secondary" onClick={() => alert("Export CSV yakında…")}>↓ CSV Export</button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div className="adm-tabs">
            {(["tümü", "hazırlanıyor", "kargoda", "teslim", "iptal"] as const).map((s) => (
              <button key={s} className={`adm-tab${statusFilter === s ? " active" : ""}`} onClick={() => setStatusFilter(s)}>
                {s === "tümü" ? "Tümü" : STATUS_LABELS[s as OrderStatus]}
              </button>
            ))}
          </div>
          <div className="adm-search" style={{ maxWidth: 220 }}>
            <span className="adm-search__icon">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6.5" cy="6.5" r="5"/><line x1="11" y1="11" x2="15" y2="15"/></svg>
            </span>
            <input className="adm-input" placeholder="Sipariş / müşteri…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="adm-card" style={{ flex: 1, overflow: "auto" }}>
          <table className="adm-table">
            <thead>
              <tr><th>Sipariş</th><th>Müşteri</th><th>Tutar</th><th>Durum</th><th>Tarih</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} style={{ cursor: "pointer" }} onClick={() => setSelected(o)}>
                  <td><span style={{ fontFamily: "var(--adm-mono)", fontSize: 12, color: "var(--adm-accent)" }}>{o.id}</span></td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 12 }}>{o.customer}</div>
                    <div style={{ fontSize: 10, color: "var(--adm-text-3)" }}>{o.email}</div>
                  </td>
                  <td style={{ fontWeight: 500 }}>₺{o.total.toFixed(2)}</td>
                  <td><span className={`adm-badge ${STATUS_MAP[o.status]}`}>{STATUS_LABELS[o.status]}</span></td>
                  <td style={{ color: "var(--adm-text-3)", fontSize: 11 }}>{o.date}</td>
                  <td>
                    <select
                      className="adm-input adm-select"
                      style={{ width: 130, padding: "3px 24px 3px 6px", fontSize: 11 }}
                      value={o.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => { e.stopPropagation(); updateStatus(o.id, e.target.value as OrderStatus); }}
                    >
                      {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sağ detay */}
      {selected && (
        <div className="adm-card" style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", marginTop: 54 }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--adm-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600 }}>Sipariş {selected.id}</span>
            <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setSelected(null)}>
              <svg width="13" height="13" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" fill="none"><line x1="2" y1="2" x2="14" y2="14"/><line x1="14" y1="2" x2="2" y2="14"/></svg>
            </button>
          </div>
          <div style={{ padding: 16, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Müşteri */}
            <div>
              <div className="adm-label" style={{ marginBottom: 8 }}>Müşteri</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{selected.customer}</div>
              <div style={{ fontSize: 11, color: "var(--adm-text-3)", marginTop: 2 }}>{selected.email}</div>
              <div style={{ fontSize: 11, color: "var(--adm-text-3)" }}>{selected.phone}</div>
            </div>
            <div className="adm-divider" style={{ margin: 0 }} />
            {/* Adres */}
            <div>
              <div className="adm-label" style={{ marginBottom: 8 }}>Teslimat Adresi</div>
              <div style={{ fontSize: 12, color: "var(--adm-text-2)", lineHeight: 1.6 }}>{selected.address}</div>
            </div>
            <div className="adm-divider" style={{ margin: 0 }} />
            {/* Ürünler */}
            <div>
              <div className="adm-label" style={{ marginBottom: 8 }}>Ürünler</div>
              {selected.items.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontSize: 12 }}>{item.name} <span style={{ color: "var(--adm-text-3)" }}>× {item.qty}</span></div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>₺{(item.price * item.qty).toFixed(2)}</div>
                </div>
              ))}
              <div className="adm-divider" style={{ margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                <span>Toplam</span>
                <span style={{ color: "var(--adm-accent)" }}>₺{selected.total.toFixed(2)}</span>
              </div>
            </div>
            {selected.note && (
              <>
                <div className="adm-divider" style={{ margin: 0 }} />
                <div>
                  <div className="adm-label" style={{ marginBottom: 4 }}>Not</div>
                  <div style={{ fontSize: 12, color: "var(--adm-text-2)", fontStyle: "italic" }}>{selected.note}</div>
                </div>
              </>
            )}
            <div className="adm-divider" style={{ margin: 0 }} />
            {/* Durum değiştir */}
            <div>
              <div className="adm-label" style={{ marginBottom: 8 }}>Durumu Güncelle</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                  <button
                    key={s}
                    className={`adm-btn adm-btn--${selected.status === s ? "primary" : "secondary"} adm-btn--sm`}
                    style={{ justifyContent: "flex-start" }}
                    onClick={() => updateStatus(selected.id, s)}
                  >
                    <span className={`adm-badge ${STATUS_MAP[s]}`} style={{ fontSize: 9, padding: "1px 5px" }}>●</span>
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
