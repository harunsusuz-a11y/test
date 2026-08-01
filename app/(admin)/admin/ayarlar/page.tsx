"use client";
import React, { useState } from "react";

export default function AdminAyarlar() {
  const [site, setSite] = useState({ name: "Venti-Ate", tagline: "Gerçek Fındık, Gerçek Protein.", email: "info@ventiateprotein.com", phone: "+90 224 000 00 00", address: "Bursa, Türkiye" });
  const [shipping, setShipping] = useState({ freeThreshold: 300, standardCost: 29.9, expressEnabled: false, expressCost: 59.9 });
  const [notif, setNotif] = useState({ newOrder: true, lowStock: true, orderDelivered: false, newsletter: true });
  const [seo, setSeo] = useState({ metaTitle: "Venti-Ate — Fındık Bazlı Protein Bar & Krema", metaDesc: "Giresun fındığından üretilen, %25 protein içeren doğal protein bar ve fındık kreması.", ogImage: "/images/og-default.jpg" });
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
          <div className="adm-page-sub">Site geneli konfigürasyon</div>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={handleSave}>
          {saved ? "✓ Kaydedildi" : "Kaydet"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, alignItems: "start" }}>
        {/* Sidebar Nav */}
        <div className="adm-card" style={{ padding: "8px 6px", position: "sticky", top: 24 }}>
          {[
            { id: "site", label: "Site Bilgileri" },
            { id: "kargo", label: "Kargo & Ödeme" },
            { id: "bildirim", label: "Bildirimler" },
            { id: "seo", label: "SEO & Meta" },
            { id: "tehlike", label: "Tehlike Bölgesi" },
          ].map(item => (
            <a key={item.id} href={`#${item.id}`} style={{
              display: "block", padding: "7px 10px", borderRadius: 6,
              fontSize: 12, color: "var(--adm-text-3)", textDecoration: "none",
              transition: "background 0.1s, color 0.1s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--adm-surface-2)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--adm-text-2)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--adm-text-3)"; }}
            >{item.label}</a>
          ))}
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Site Bilgileri */}
          <section id="site" className="adm-card">
            <div className="adm-card-header"><span className="adm-card-title">Site Bilgileri</span></div>
            <div className="adm-card-body">
              <div className="adm-field-row">
                <F label="Site Adı"><input className="adm-input" value={site.name} onChange={e => setSite({ ...site, name: e.target.value })} /></F>
                <F label="Slogan"><input className="adm-input" value={site.tagline} onChange={e => setSite({ ...site, tagline: e.target.value })} /></F>
              </div>
              <div className="adm-field-row">
                <F label="E-posta"><input className="adm-input" type="email" value={site.email} onChange={e => setSite({ ...site, email: e.target.value })} /></F>
                <F label="Telefon"><input className="adm-input" value={site.phone} onChange={e => setSite({ ...site, phone: e.target.value })} /></F>
              </div>
              <F label="Adres"><input className="adm-input" value={site.address} onChange={e => setSite({ ...site, address: e.target.value })} /></F>
            </div>
          </section>

          {/* Kargo */}
          <section id="kargo" className="adm-card">
            <div className="adm-card-header"><span className="adm-card-title">Kargo & Ödeme</span></div>
            <div className="adm-card-body">
              <div className="adm-field-row">
                <F label="Ücretsiz Kargo Eşiği (₺)">
                  <input className="adm-input" type="number" value={shipping.freeThreshold} onChange={e => setShipping({ ...shipping, freeThreshold: Number(e.target.value) })} />
                </F>
                <F label="Standart Kargo Ücreti (₺)">
                  <input className="adm-input" type="number" value={shipping.standardCost} onChange={e => setShipping({ ...shipping, standardCost: Number(e.target.value) })} />
                </F>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--adm-border)" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--adm-text-2)" }}>Ekspres Kargo</div>
                  <div style={{ fontSize: 11, color: "var(--adm-text-4)" }}>Aynı gün veya ertesi gün teslimat seçeneği</div>
                </div>
                <div className={`adm-toggle${shipping.expressEnabled ? " on" : ""}`} onClick={() => setShipping({ ...shipping, expressEnabled: !shipping.expressEnabled })} />
              </div>
              {shipping.expressEnabled && (
                <div style={{ marginTop: 12 }}>
                  <F label="Ekspres Kargo Ücreti (₺)">
                    <input className="adm-input" type="number" value={shipping.expressCost} onChange={e => setShipping({ ...shipping, expressCost: Number(e.target.value) })} />
                  </F>
                </div>
              )}
            </div>
          </section>

          {/* Bildirimler */}
          <section id="bildirim" className="adm-card">
            <div className="adm-card-header"><span className="adm-card-title">Bildirimler</span></div>
            <div className="adm-card-body">
              {[
                { key: "newOrder",       label: "Yeni sipariş bildirimi",   sub: "Her yeni sipariş geldiğinde e-posta al" },
                { key: "lowStock",       label: "Düşük stok uyarısı",       sub: "Stok 10 adetin altına düştüğünde bildir" },
                { key: "orderDelivered", label: "Sipariş teslim bildirimi", sub: "Müşteri siparişini teslim aldığında bildir" },
                { key: "newsletter",    label: "Bülten bildirimi",          sub: "Yeni bülten abonelerini bildir" },
              ].map(item => (
                <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--adm-border)" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "var(--adm-text-2)" }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "var(--adm-text-4)" }}>{item.sub}</div>
                  </div>
                  <div
                    className={`adm-toggle${notif[item.key as keyof typeof notif] ? " on" : ""}`}
                    onClick={() => setNotif({ ...notif, [item.key]: !notif[item.key as keyof typeof notif] })}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* SEO */}
          <section id="seo" className="adm-card">
            <div className="adm-card-header"><span className="adm-card-title">SEO & Meta</span></div>
            <div className="adm-card-body">
              <F label="Meta Başlık">
                <input className="adm-input" value={seo.metaTitle} onChange={e => setSeo({ ...seo, metaTitle: e.target.value })} maxLength={60} />
                <div style={{ fontSize: 10, color: seo.metaTitle.length > 55 ? "var(--adm-yellow)" : "var(--adm-text-4)", marginTop: 4 }}>{seo.metaTitle.length}/60 karakter</div>
              </F>
              <F label="Meta Açıklama">
                <textarea className="adm-textarea" value={seo.metaDesc} onChange={e => setSeo({ ...seo, metaDesc: e.target.value })} maxLength={160} rows={3} />
                <div style={{ fontSize: 10, color: seo.metaDesc.length > 150 ? "var(--adm-yellow)" : "var(--adm-text-4)", marginTop: 4 }}>{seo.metaDesc.length}/160 karakter</div>
              </F>
              <F label="OG Görsel URL">
                <input className="adm-input" value={seo.ogImage} onChange={e => setSeo({ ...seo, ogImage: e.target.value })} />
              </F>
              {/* Preview */}
              <div style={{ background: "var(--adm-surface-2)", border: "1px solid var(--adm-border)", borderRadius: 8, padding: 12, marginTop: 8 }}>
                <div style={{ fontSize: 10, color: "var(--adm-text-4)", marginBottom: 6 }}>Google önizleme</div>
                <div style={{ fontSize: 13, color: "#1a73e8", fontWeight: 500, marginBottom: 2 }}>{seo.metaTitle}</div>
                <div style={{ fontSize: 11, color: "#3c4043" }}>{seo.metaDesc}</div>
              </div>
            </div>
          </section>

          {/* Tehlike */}
          <section id="tehlike" className="adm-card" style={{ border: "1px solid rgba(248,113,113,0.2)" }}>
            <div className="adm-card-header" style={{ borderColor: "rgba(248,113,113,0.15)" }}>
              <span className="adm-card-title" style={{ color: "var(--adm-red)" }}>Tehlike Bölgesi</span>
            </div>
            <div className="adm-card-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--adm-border)" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--adm-text-2)" }}>Tüm demo veriyi sıfırla</div>
                  <div style={{ fontSize: 11, color: "var(--adm-text-4)" }}>Siparişler ve kuponlar başlangıç durumuna döner</div>
                </div>
                <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => alert("Bu özellik gerçek sistemde çalışır.")}>Sıfırla</button>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--adm-red)" }}>Panelden çıkış yap</div>
                  <div style={{ fontSize: 11, color: "var(--adm-text-4)" }}>Oturum sonlandırılır</div>
                </div>
                <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => alert("Çıkış yapıldı (demo).")}>Çıkış Yap</button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="adm-field">
      <label className="adm-label-text">{label}</label>
      {children}
    </div>
  );
}
