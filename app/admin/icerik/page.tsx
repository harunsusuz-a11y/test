"use client";
import React, { useState } from "react";

type Tab = "announcement" | "sss" | "seo" | "footer";

const TABS = [
  { key: "announcement", label: "Duyuru Barı" },
  { key: "sss", label: "SSS" },
  { key: "seo", label: "SEO" },
  { key: "footer", label: "Footer" },
] as const;

const INITIAL_SSS = [
  { id: "1", q: "Ürünleriniz gerçekten %100 Giresun fındığı içeriyor mu?", a: "Evet, tüm ürünlerimizde kullandığımız fındıklar doğrudan Giresun üreticilerinden temin edilmektedir." },
  { id: "2", q: "Kaç günde kargoya veriyorsunuz?", a: "Siparişiniz iş günü 14:00'e kadar verilmişse aynı gün, sonrasında ertesi iş günü kargoya verilir." },
  { id: "3", q: "Abonelik sistemini nasıl iptal edebilirim?", a: "Hesabım sayfanızdan abonelik ayarlarına girerek istediğiniz zaman iptal edebilirsiniz." },
];

type SSSItem = { id: string; q: string; a: string };

export default function AdminIcerik() {
  const [tab, setTab] = useState<Tab>("announcement");
  const [announcement, setAnnouncement] = useState("🥜 VENTI10 koduyla ilk siparişinde %10 indirim · Ücretsiz kargo ₺300 ve üzeri");
  const [announcementActive, setAnnouncementActive] = useState(true);
  const [sss, setSss] = useState<SSSItem[]>(INITIAL_SSS);
  const [editingSss, setEditingSss] = useState<SSSItem | null>(null);
  const [sssModal, setSssModal] = useState(false);
  const [seo, setSeo] = useState({
    siteTitle: "Venti-Ate",
    tagline: "Giresun'dan Gelen Güç",
    description: "Gerçek Giresun fındığıyla üretilmiş protein barlar ve fındık kremaları. Antrenman öncesi ve sonrası için tasarlandı.",
    keywords: "protein bar, fındık kreması, Giresun fındığı, sağlıklı atıştırmalık",
    ogImage: "/images/og-default.jpg",
  });
  const [footerText, setFooterText] = useState("© 2026 Venti-Ate. Tüm hakları saklıdır. Giresun fındığından üretilmiştir.");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function openNewSss() {
    setEditingSss({ id: Date.now().toString(), q: "", a: "" });
    setSssModal(true);
  }

  function openEditSss(item: SSSItem) {
    setEditingSss({ ...item });
    setSssModal(true);
  }

  function saveSss() {
    if (!editingSss?.q.trim()) return;
    setSss((prev) => {
      const idx = prev.findIndex((s) => s.id === editingSss.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = editingSss; return next; }
      return [...prev, editingSss];
    });
    setSssModal(false); setEditingSss(null);
  }

  function removeSss(id: string) {
    setSss((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">İçerik & SEO</div>
          <div className="adm-page-sub">Site içeriği, SSS ve arama motoru ayarları</div>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={handleSave}>
          {saved ? "✓ Kaydedildi" : "Kaydet"}
        </button>
      </div>

      {/* Tabs */}
      <div className="adm-tabs" style={{ marginBottom: 20 }}>
        {TABS.map((t) => (
          <button key={t.key} className={`adm-tab${tab === t.key ? " active" : ""}`} onClick={() => setTab(t.key as Tab)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Duyuru */}
      {tab === "announcement" && (
        <div className="adm-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Duyuru Barı</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label className="adm-toggle">
                <input type="checkbox" checked={announcementActive} onChange={(e) => setAnnouncementActive(e.target.checked)} />
                <span className="adm-toggle__track" />
              </label>
              <span style={{ fontSize: 13, color: "var(--adm-text-2)" }}>Duyuru barını göster</span>
            </div>
            <div className="adm-field">
              <label>Duyuru Metni</label>
              <input className="adm-input" value={announcement} onChange={(e) => setAnnouncement(e.target.value)} />
              <span className="adm-field-hint">Emoji kullanabilirsiniz. Kupon kodunu burada duyurun.</span>
            </div>
            {/* Preview */}
            <div>
              <div className="adm-label" style={{ marginBottom: 8 }}>Önizleme</div>
              <div style={{
                padding: "10px 16px", background: "#56312d", color: "#fff",
                borderRadius: 6, textAlign: "center", fontSize: 13,
                opacity: announcementActive ? 1 : 0.4,
              }}>{announcement}</div>
            </div>
          </div>
        </div>
      )}

      {/* SSS */}
      {tab === "sss" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button className="adm-btn adm-btn--primary" onClick={openNewSss}>+ Soru Ekle</button>
          </div>
          <div className="adm-card">
            <table className="adm-table">
              <thead><tr><th>Soru</th><th>Cevap</th><th style={{ textAlign: "right" }}>İşlem</th></tr></thead>
              <tbody>
                {sss.map((item) => (
                  <tr key={item.id}>
                    <td style={{ maxWidth: 200, fontWeight: 500, fontSize: 12 }}>{item.q}</td>
                    <td style={{ color: "var(--adm-text-2)", fontSize: 12, maxWidth: 300 }}>{item.a.slice(0, 80)}{item.a.length > 80 ? "…" : ""}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => openEditSss(item)}>Düzenle</button>
                        <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => removeSss(item.id)}>Sil</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sssModal && editingSss && (
            <div className="adm-overlay" onClick={(e) => e.target === e.currentTarget && setSssModal(false)}>
              <div className="adm-modal">
                <div className="adm-modal__header">
                  <span style={{ fontWeight: 600 }}>SSS Düzenle</span>
                  <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setSssModal(false)}>
                    <svg width="14" height="14" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" fill="none"><line x1="2" y1="2" x2="14" y2="14"/><line x1="14" y1="2" x2="2" y2="14"/></svg>
                  </button>
                </div>
                <div className="adm-modal__body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="adm-field">
                    <label>Soru</label>
                    <input className="adm-input" value={editingSss.q} onChange={(e) => setEditingSss({ ...editingSss, q: e.target.value })} />
                  </div>
                  <div className="adm-field">
                    <label>Cevap</label>
                    <textarea className="adm-input adm-textarea" value={editingSss.a} onChange={(e) => setEditingSss({ ...editingSss, a: e.target.value })} style={{ minHeight: 100 }} />
                  </div>
                </div>
                <div className="adm-modal__footer">
                  <button className="adm-btn adm-btn--secondary" onClick={() => setSssModal(false)}>İptal</button>
                  <button className="adm-btn adm-btn--primary" onClick={saveSss}>Kaydet</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SEO */}
      {tab === "seo" && (
        <div className="adm-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>SEO Ayarları</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="adm-grid-2">
              <div className="adm-field">
                <label>Site Başlığı</label>
                <input className="adm-input" value={seo.siteTitle} onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })} />
              </div>
              <div className="adm-field">
                <label>Slogan</label>
                <input className="adm-input" value={seo.tagline} onChange={(e) => setSeo({ ...seo, tagline: e.target.value })} />
              </div>
            </div>
            <div className="adm-field">
              <label>Meta Açıklaması</label>
              <textarea className="adm-input adm-textarea" value={seo.description} onChange={(e) => setSeo({ ...seo, description: e.target.value })} />
              <span className="adm-field-hint">{seo.description.length}/160 karakter</span>
            </div>
            <div className="adm-field">
              <label>Anahtar Kelimeler</label>
              <input className="adm-input" value={seo.keywords} onChange={(e) => setSeo({ ...seo, keywords: e.target.value })} />
            </div>
            <div className="adm-field">
              <label>OG Görseli</label>
              <input className="adm-input" value={seo.ogImage} onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })} />
            </div>
            {/* Preview */}
            <div>
              <div className="adm-label" style={{ marginBottom: 8 }}>Google Önizleme</div>
              <div style={{ background: "var(--adm-surface-2)", padding: 14, borderRadius: 8, maxWidth: 500 }}>
                <div style={{ fontSize: 11, color: "var(--adm-text-3)", marginBottom: 2 }}>ventiate.com</div>
                <div style={{ fontSize: 16, color: "#60a5fa", fontWeight: 500, marginBottom: 4 }}>{seo.siteTitle} — {seo.tagline}</div>
                <div style={{ fontSize: 12, color: "var(--adm-text-2)", lineHeight: 1.5 }}>{seo.description.slice(0, 155)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {tab === "footer" && (
        <div className="adm-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Footer Ayarları</div>
          <div className="adm-field">
            <label>Copyright Metni</label>
            <input className="adm-input" value={footerText} onChange={(e) => setFooterText(e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
}
