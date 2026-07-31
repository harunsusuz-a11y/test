"use client";
import React, { useState } from "react";

export default function AdminAyarlar() {
  const [shipping, setShipping] = useState({ threshold: 300, cost: 29.9, active: true });
  const [bundle, setBundle] = useState({ rate: 10, active: true });
  const [store, setStore] = useState({
    name: "Venti-Ate",
    email: "info@ventiate.com",
    phone: "+90 555 000 00 00",
    address: "Bursa, Türkiye",
    instagram: "@ventiate",
  });
  const [maintenance, setMaintenance] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Ayarlar</div>
          <div className="adm-page-sub">Mağaza, kargo ve sistem ayarları</div>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={handleSave}>
          {saved ? "✓ Kaydedildi" : "Kaydet"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
        {/* Mağaza bilgileri */}
        <div className="adm-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Mağaza Bilgileri</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="adm-grid-2">
              <div className="adm-field">
                <label>Mağaza Adı</label>
                <input className="adm-input" value={store.name} onChange={(e) => setStore({ ...store, name: e.target.value })} />
              </div>
              <div className="adm-field">
                <label>E-posta</label>
                <input className="adm-input" type="email" value={store.email} onChange={(e) => setStore({ ...store, email: e.target.value })} />
              </div>
            </div>
            <div className="adm-grid-2">
              <div className="adm-field">
                <label>Telefon</label>
                <input className="adm-input" value={store.phone} onChange={(e) => setStore({ ...store, phone: e.target.value })} />
              </div>
              <div className="adm-field">
                <label>Instagram</label>
                <input className="adm-input" value={store.instagram} onChange={(e) => setStore({ ...store, instagram: e.target.value })} />
              </div>
            </div>
            <div className="adm-field">
              <label>Adres</label>
              <input className="adm-input" value={store.address} onChange={(e) => setStore({ ...store, address: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Kargo */}
        <div className="adm-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Kargo Ayarları</span>
            <label className="adm-toggle">
              <input type="checkbox" checked={shipping.active} onChange={(e) => setShipping({ ...shipping, active: e.target.checked })} />
              <span className="adm-toggle__track" />
            </label>
          </div>
          <div className="adm-grid-2">
            <div className="adm-field">
              <label>Ücretsiz Kargo Eşiği (₺)</label>
              <input className="adm-input" type="number" value={shipping.threshold} onChange={(e) => setShipping({ ...shipping, threshold: parseFloat(e.target.value) || 0 })} />
              <span className="adm-field-hint">Bu tutarın üzerinde kargo ücretsiz</span>
            </div>
            <div className="adm-field">
              <label>Standart Kargo Ücreti (₺)</label>
              <input className="adm-input" type="number" step="0.01" value={shipping.cost} onChange={(e) => setShipping({ ...shipping, cost: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
        </div>

        {/* Paket indirimi */}
        <div className="adm-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Bar + Krema Paket İndirimi</div>
              <div style={{ fontSize: 11, color: "var(--adm-text-3)", marginTop: 2 }}>Sepette her iki kategoriden ürün varsa otomatik uygulanır</div>
            </div>
            <label className="adm-toggle">
              <input type="checkbox" checked={bundle.active} onChange={(e) => setBundle({ ...bundle, active: e.target.checked })} />
              <span className="adm-toggle__track" />
            </label>
          </div>
          <div className="adm-field" style={{ maxWidth: 200 }}>
            <label>İndirim Oranı (%)</label>
            <input className="adm-input" type="number" min={1} max={50} value={bundle.rate} onChange={(e) => setBundle({ ...bundle, rate: parseInt(e.target.value) || 0 })} />
          </div>
        </div>

        {/* Tehlikeli bölge */}
        <div className="adm-card" style={{ padding: 20, borderColor: "rgba(239,68,68,0.2)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--adm-red)", marginBottom: 16 }}>Tehlikeli Bölge</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--adm-red-dim)", borderRadius: 6, border: "1px solid rgba(239,68,68,0.15)" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Bakım Modu</div>
              <div style={{ fontSize: 11, color: "var(--adm-text-3)", marginTop: 2 }}>Aktif olduğunda müşteriler siteye erişemez</div>
            </div>
            <label className="adm-toggle">
              <input type="checkbox" checked={maintenance} onChange={(e) => {
                if (e.target.checked && !confirm("Bakım modunu açmak istiyor musunuz? Müşteriler siteye erişemeyecek.")) return;
                setMaintenance(e.target.checked);
              }} />
              <span className="adm-toggle__track" style={maintenance ? { background: "var(--adm-red)" } : {}} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
