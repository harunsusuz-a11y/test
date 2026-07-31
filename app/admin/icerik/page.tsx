"use client";
import React, { useState } from "react";

const TABS = ["Anasayfa", "Hakkımızda", "Ürünler", "SSS", "Blog"] as const;
type Tab = typeof TABS[number];

const HOMEPAGE = {
  heroTitle:    "Giresun'dan Gelen\nGerçek Lezzet",
  heroSubtitle: "Fındık bazlı protein bar ve fındık kreması — doğal, besleyici, gerçek.",
  heroCta:      "Alışverişe Başla",
  announcementBar: "Tüm siparişlerde VENTI10 koduyla %10 indirim · Ücretsiz kargo ₺300+",
  featuredTitle: "Öne Çıkan Ürünler",
  aboutSnippet: "Giresun fındığını modern protein ihtiyacıyla buluşturuyoruz.",
};

const FAQS_INIT = [
  { id: 1, q: "Ürünler doğal mı?", a: "Evet, tüm ürünlerimiz katkısız ve doğal hammaddelerle üretilmektedir." },
  { id: 2, q: "Kargo ne kadar sürer?", a: "Siparişler 1-3 iş günü içinde kargoya verilir. İstanbul içi 1 günde teslim." },
  { id: 3, q: "İade politikanız nedir?", a: "Ürün tesliminden itibaren 14 gün içinde iade hakkınız bulunmaktadır." },
];

const BLOG_POSTS_INIT = [
  { id: 1, title: "Fındık Proteini: Neden Önemli?", slug: "findik-proteini", status: "yayında", date: "28 Tem 2026" },
  { id: 2, title: "Antrenman Sonrası En İyi Atıştırmalıklar", slug: "antrenman-sonrasi", status: "taslak", date: "25 Tem 2026" },
  { id: 3, title: "Protein Bar vs Protein Tozu", slug: "bar-vs-toz", status: "yayında", date: "20 Tem 2026" },
];

export default function AdminIcerik() {
  const [tab, setTab] = useState<Tab>("Anasayfa");
  const [home, setHome] = useState(HOMEPAGE);
  const [faqs, setFaqs] = useState(FAQS_INIT);
  const [posts, setPosts] = useState(BLOG_POSTS_INIT);
  const [faqModal, setFaqModal] = useState<{ id?: number; q: string; a: string } | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  function saveFaq() {
    if (!faqModal) return;
    if (faqModal.id) {
      setFaqs(prev => prev.map(f => f.id === faqModal.id ? { ...f, q: faqModal.q, a: faqModal.a } : f));
    } else {
      setFaqs(prev => [...prev, { id: Date.now(), q: faqModal.q, a: faqModal.a }]);
    }
    setFaqModal(null);
  }

  function togglePostStatus(id: number) {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status: p.status === "yayında" ? "taslak" : "yayında" } : p));
  }

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">İçerik & SEO</div>
          <div className="adm-page-sub">Site içeriklerini buradan yönet</div>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={handleSave}>{saved ? "✓ Kaydedildi" : "Kaydet"}</button>
      </div>

      {/* Tab Bar */}
      <div className="adm-tabs" style={{ marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t} className={`adm-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* Anasayfa */}
      {tab === "Anasayfa" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="adm-card">
            <div className="adm-card-header"><span className="adm-card-title">Hero Bölümü</span></div>
            <div className="adm-card-body">
              <F label="Başlık">
                <textarea className="adm-textarea" rows={2} value={home.heroTitle} onChange={e => setHome({ ...home, heroTitle: e.target.value })} />
              </F>
              <F label="Alt Başlık">
                <input className="adm-input" value={home.heroSubtitle} onChange={e => setHome({ ...home, heroSubtitle: e.target.value })} />
              </F>
              <F label="CTA Butonu">
                <input className="adm-input" value={home.heroCta} onChange={e => setHome({ ...home, heroCta: e.target.value })} />
              </F>
            </div>
          </div>
          <div className="adm-card">
            <div className="adm-card-header"><span className="adm-card-title">Duyuru Barı</span></div>
            <div className="adm-card-body">
              <F label="Metin">
                <input className="adm-input" value={home.announcementBar} onChange={e => setHome({ ...home, announcementBar: e.target.value })} />
              </F>
              <div style={{ padding: "10px 14px", background: "var(--adm-surface-2)", borderRadius: 6, marginTop: 8 }}>
                <div style={{ fontSize: 11, color: "var(--adm-text-3)", marginBottom: 5 }}>Önizleme</div>
                <div style={{ fontSize: 12, color: "var(--adm-accent)", textAlign: "center" }}>{home.announcementBar}</div>
              </div>
            </div>
          </div>
          <div className="adm-card">
            <div className="adm-card-header"><span className="adm-card-title">Hakkımızda Snippet</span></div>
            <div className="adm-card-body">
              <F label="Kısa Metin">
                <input className="adm-input" value={home.aboutSnippet} onChange={e => setHome({ ...home, aboutSnippet: e.target.value })} />
              </F>
            </div>
          </div>
        </div>
      )}

      {/* SSS */}
      {tab === "SSS" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button className="adm-btn adm-btn--secondary" onClick={() => setFaqModal({ q: "", a: "" })}>+ Yeni SSS</button>
          </div>
          <div className="adm-card">
            {faqs.length === 0 && <div className="adm-empty"><div className="adm-empty__title">Henüz SSS yok</div></div>}
            {faqs.map((f, i) => (
              <div key={f.id} style={{
                padding: "14px 16px",
                borderBottom: i < faqs.length - 1 ? "1px solid var(--adm-border)" : "none",
              }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--adm-text)", marginBottom: 4 }}>{f.q}</div>
                    <div style={{ fontSize: 12, color: "var(--adm-text-3)", lineHeight: 1.6 }}>{f.a}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setFaqModal({ id: f.id, q: f.q, a: f.a })}>Düzenle</button>
                    <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => setFaqs(prev => prev.filter(x => x.id !== f.id))}>Sil</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {faqModal && (
            <div className="adm-overlay" onClick={() => setFaqModal(null)}>
              <div className="adm-modal" onClick={e => e.stopPropagation()}>
                <div className="adm-modal-header">
                  <span className="adm-modal-title">{faqModal.id ? "SSS Düzenle" : "Yeni SSS"}</span>
                  <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setFaqModal(null)}>✕</button>
                </div>
                <div className="adm-modal-body">
                  <F label="Soru">
                    <input className="adm-input" value={faqModal.q} onChange={e => setFaqModal({ ...faqModal, q: e.target.value })} placeholder="Soru metni" />
                  </F>
                  <F label="Cevap">
                    <textarea className="adm-textarea" rows={4} value={faqModal.a} onChange={e => setFaqModal({ ...faqModal, a: e.target.value })} placeholder="Cevap metni" />
                  </F>
                </div>
                <div className="adm-modal-footer">
                  <button className="adm-btn adm-btn--secondary" onClick={() => setFaqModal(null)}>İptal</button>
                  <button className="adm-btn adm-btn--primary" onClick={saveFaq}>Kaydet</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Blog */}
      {tab === "Blog" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button className="adm-btn adm-btn--primary">+ Yeni Yazı</button>
          </div>
          <div className="adm-card">
            <table className="adm-table">
              <thead><tr><th>Başlık</th><th>Slug</th><th>Tarih</th><th>Durum</th><th /></tr></thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id}>
                    <td className="adm-td--strong">{p.title}</td>
                    <td className="adm-mono adm-text-muted">{p.slug}</td>
                    <td className="adm-text-muted">{p.date}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className={`adm-toggle${p.status === "yayında" ? " on" : ""}`} onClick={() => togglePostStatus(p.id)} />
                        <span className={`adm-badge ${p.status === "yayında" ? "adm-badge--green" : "adm-badge--muted"}`}>{p.status}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        <button className="adm-btn adm-btn--ghost adm-btn--sm">Düzenle</button>
                        <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => setPosts(prev => prev.filter(x => x.id !== p.id))}>Sil</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Placeholder tabs */}
      {(tab === "Hakkımızda" || tab === "Ürünler") && (
        <div className="adm-card">
          <div className="adm-empty">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" width="32" height="32"><rect x="2" y="1" width="10" height="14" rx="1.5"/><line x1="5" y1="5" x2="9" y2="5"/><line x1="5" y1="8" x2="9" y2="8"/><line x1="5" y1="11" x2="7" y2="11"/></svg>
            <div className="adm-empty__title">{tab} içeriği</div>
            Bu bölüm yakında aktif olacak.
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="adm-field"><label className="adm-label-text">{label}</label>{children}</div>;
}
