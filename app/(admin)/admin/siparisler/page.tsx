"use client";
import React, { useState } from "react";

type Status = "hazırlanıyor" | "kargoda" | "teslim" | "iptal";

interface Order {
  id: string; customer: string; email: string; phone: string;
  address: string; items: { name: string; qty: number; price: number }[];
  total: number; status: Status; date: string; cargo?: string; note?: string;
}

const ORDERS: Order[] = [
  { id: "#1024", customer: "Elif Kaya",     email: "elif@example.com",   phone: "0532 111 22 33", address: "Bağcılar Mah. No:12/4, Bursa",   items: [{ name: "Tiramisu Fındıklı Protein Bar", qty: 3, price: 39.9 }], total: 119.70, status: "kargoda",      date: "31 Tem 2026", cargo: "MNG / 1234567890", note: "Kapıda zil çalma" },
  { id: "#1023", customer: "Mehmet Tunç",   email: "mtunc@example.com",  phone: "0541 222 33 44", address: "Çankaya, Ankara",                 items: [{ name: "Sade Fındık Kreması", qty: 2, price: 94.9 }],          total: 189.80, status: "teslim",      date: "30 Tem 2026" },
  { id: "#1022", customer: "Ayşe Şahin",   email: "ayse@example.com",   phone: "0555 333 44 55", address: "Kadıköy, İstanbul",               items: [{ name: "Tiramisu Protein Bar", qty: 1, price: 39.9 }, { name: "Sade Fındık Kreması", qty: 1, price: 94.9 }], total: 134.80, status: "hazırlanıyor", date: "30 Tem 2026" },
  { id: "#1021", customer: "Derya Çelik",  email: "derya@example.com",  phone: "0544 444 55 66", address: "Konak, İzmir",                   items: [{ name: "Tiramisu Fındıklı Protein Bar", qty: 5, price: 39.9 }], total: 199.50, status: "iptal",       date: "29 Tem 2026" },
  { id: "#1020", customer: "Selin Yıldız", email: "selin@example.com",  phone: "0533 555 66 77", address: "Nilüfer, Bursa",                  items: [{ name: "Kakao Fındıklı Protein Bar", qty: 2, price: 39.9 }],   total:  79.80, status: "teslim",      date: "29 Tem 2026" },
  { id: "#1019", customer: "Can Arslan",   email: "can@example.com",    phone: "0546 666 77 88", address: "Keçiören, Ankara",                items: [{ name: "Fındık Kreması Jumbo", qty: 1, price: 149.9 }],         total: 149.90, status: "kargoda",     date: "28 Tem 2026", cargo: "Yurtiçi / 9876543" },
  { id: "#1018", customer: "Nur Demir",   email: "nurd@example.com",   phone: "0537 777 88 99", address: "Bornova, İzmir",                   items: [{ name: "Kakao Bar", qty: 3, price: 39.9 }, { name: "Tiramisu Bar", qty: 2, price: 39.9 }], total: 199.50, status: "hazırlanıyor", date: "28 Tem 2026" },
];

const STATUS_MAP: Record<Status, string>  = { hazırlanıyor: "adm-badge--yellow", kargoda: "adm-badge--blue", teslim: "adm-badge--green", iptal: "adm-badge--red" };
const STATUS_NEXT: Record<Status, Status | null> = { hazırlanıyor: "kargoda", kargoda: "teslim", teslim: null, iptal: null };
const ALL_STATUSES: Status[] = ["hazırlanıyor", "kargoda", "teslim", "iptal"];

export default function AdminSiparisler() {
  const [orders, setOrders]   = useState<Order[]>(ORDERS);
  const [filter, setFilter]   = useState<Status | "tümü">("tümü");
  const [search, setSearch]   = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = orders.filter(o => {
    const ms = filter === "tümü" || o.status === filter;
    const mq = o.id.includes(search) || o.customer.toLowerCase().includes(search.toLowerCase());
    return ms && mq;
  });

  function advance(id: string) {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next = STATUS_NEXT[o.status];
      return next ? { ...o, status: next } : o;
    }));
    if (selected?.id === id) {
      const next = STATUS_NEXT[selected.status];
      if (next) setSelected({ ...selected, status: next });
    }
  }

  function cancel(id: string) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "iptal" } : o));
    if (selected?.id === id) setSelected({ ...selected, status: "iptal" });
  }

  const counts = {
    tümü: orders.length,
    hazırlanıyor: orders.filter(o => o.status === "hazırlanıyor").length,
    kargoda: orders.filter(o => o.status === "kargoda").length,
    teslim: orders.filter(o => o.status === "teslim").length,
    iptal: orders.filter(o => o.status === "iptal").length,
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Siparişler</div>
          <div className="adm-page-sub">{orders.length} sipariş · {filtered.length} gösteriliyor</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="adm-btn adm-btn--secondary">↓ Dışa aktar</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div className="adm-tabs">
          {(["tümü", ...ALL_STATUSES] as const).map(s => (
            <button key={s} className={`adm-tab${filter === s ? " active" : ""}`} onClick={() => setFilter(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.7 }}>({counts[s]})</span>
            </button>
          ))}
        </div>
        <div className="adm-search" style={{ flex: 1, maxWidth: 280 }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/></svg>
          <input className="adm-input" placeholder="Sipariş veya müşteri ara…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="adm-card">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Sipariş No</th>
              <th>Müşteri</th>
              <th>Ürünler</th>
              <th>Toplam</th>
              <th>Durum</th>
              <th>Tarih</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} style={{ cursor: "pointer" }} onClick={() => setSelected(o)}>
                <td className="adm-td--mono">{o.id}</td>
                <td>
                  <div style={{ fontWeight: 500, color: "var(--adm-text)" }}>{o.customer}</div>
                  <div style={{ fontSize: 10, color: "var(--adm-text-4)" }}>{o.email}</div>
                </td>
                <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {o.items.map(i => `${i.name} ×${i.qty}`).join(", ")}
                </td>
                <td className="adm-td--strong" style={{ fontFamily: "var(--adm-mono)" }}>₺{o.total.toFixed(2)}</td>
                <td><span className={`adm-badge ${STATUS_MAP[o.status]}`}>{o.status}</span></td>
                <td className="adm-text-muted">{o.date}</td>
                <td onClick={e => e.stopPropagation()}>
                  <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    {STATUS_NEXT[o.status] && (
                      <button className="adm-btn adm-btn--secondary adm-btn--sm" onClick={() => advance(o.id)}>
                        → {STATUS_NEXT[o.status]}
                      </button>
                    )}
                    {o.status !== "iptal" && o.status !== "teslim" && (
                      <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => cancel(o.id)}>İptal</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="adm-empty">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M2 4h12l-1 10H3L2 4z"/><path d="M5 4V3a3 3 0 016 0v1"/></svg>
            <div className="adm-empty__title">Sipariş bulunamadı</div>
          </div>
        )}
      </div>

      {/* Drawer — Order Detail */}
      {selected && (
        <>
          <div className="adm-overlay" style={{ justifyContent: "flex-end", padding: 0, alignItems: "stretch" }} onClick={() => setSelected(null)} />
          <div className="adm-drawer">
            <div className="adm-drawer-header">
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--adm-text)" }}>Sipariş {selected.id}</div>
                <div style={{ fontSize: 11, color: "var(--adm-text-3)", marginTop: 2 }}>{selected.date}</div>
              </div>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="adm-drawer-body">
              {/* Status */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <span className={`adm-badge ${STATUS_MAP[selected.status]}`} style={{ fontSize: 11, padding: "4px 12px" }}>
                  {selected.status}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  {STATUS_NEXT[selected.status] && (
                    <button className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => advance(selected.id)}>
                      → {STATUS_NEXT[selected.status]}
                    </button>
                  )}
                  {selected.status !== "iptal" && selected.status !== "teslim" && (
                    <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => cancel(selected.id)}>İptal Et</button>
                  )}
                </div>
              </div>

              {/* Customer */}
              <div className="adm-card" style={{ marginBottom: 12 }}>
                <div className="adm-card-header"><span className="adm-card-title">Müşteri Bilgileri</span></div>
                <div className="adm-card-body">
                  <Row label="Ad Soyad" value={selected.customer} />
                  <Row label="E-posta"  value={selected.email} />
                  <Row label="Telefon"  value={selected.phone} />
                  <Row label="Adres"    value={selected.address} />
                  {selected.note && <Row label="Not" value={selected.note} accent />}
                </div>
              </div>

              {/* Items */}
              <div className="adm-card" style={{ marginBottom: 12 }}>
                <div className="adm-card-header"><span className="adm-card-title">Ürünler</span></div>
                <div>
                  {selected.items.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 14px",
                      borderBottom: i < selected.items.length - 1 ? "1px solid var(--adm-border)" : "none",
                    }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--adm-text-2)" }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: "var(--adm-text-4)" }}>× {item.qty} adet</div>
                      </div>
                      <span style={{ fontFamily: "var(--adm-mono)", fontWeight: 600, color: "var(--adm-text)" }}>
                        ₺{(item.qty * item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "10px 14px",
                    borderTop: "1px solid var(--adm-border-2)",
                    fontWeight: 700, color: "var(--adm-text)",
                    fontFamily: "var(--adm-mono)",
                  }}>
                    <span>Toplam</span>
                    <span style={{ color: "var(--adm-accent)" }}>₺{selected.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Cargo */}
              {selected.cargo && (
                <div className="adm-card">
                  <div className="adm-card-header"><span className="adm-card-title">Kargo</span></div>
                  <div className="adm-card-body">
                    <Row label="Takip" value={selected.cargo} mono />
                  </div>
                </div>
              )}
            </div>
            <div className="adm-drawer-footer">
              <button className="adm-btn adm-btn--secondary" onClick={() => setSelected(null)}>Kapat</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value, accent, mono }: { label: string; value: string; accent?: boolean; mono?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
      <span style={{ fontSize: 11, color: "var(--adm-text-4)", width: 70, flexShrink: 0, paddingTop: 1 }}>{label}</span>
      <span style={{
        fontSize: 12, color: accent ? "var(--adm-yellow)" : "var(--adm-text-2)",
        fontFamily: mono ? "var(--adm-mono)" : undefined,
        flex: 1,
      }}>{value}</span>
    </div>
  );
}
