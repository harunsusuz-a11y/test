"use client";
import React, { useState } from "react";
import { demoCoupons, type DemoCoupon } from "@/content/discounts";

type Coupon = DemoCoupon & { active: boolean; usageCount: number; maxUsage?: number; expiresAt?: string };

const INITIAL: Coupon[] = [
  ...demoCoupons.map((c) => ({ ...c, active: true, usageCount: 23 })),
  { code: "HOSGELDIN20", discountType: "percent", discountValue: 20, isDemo: true, active: false, usageCount: 0, maxUsage: 100, expiresAt: "2026-08-31" },
];

const EMPTY: Coupon = {
  code: "", discountType: "percent", discountValue: 10, isDemo: true,
  active: true, usageCount: 0, maxUsage: undefined, expiresAt: undefined,
};

export default function AdminKuponlar() {
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function openNew() { setEditing({ ...EMPTY }); setModalOpen(true); }
  function openEdit(c: Coupon) { setEditing({ ...c }); setModalOpen(true); }

  function save() {
    if (!editing || !editing.code.trim()) return;
    setCoupons((prev) => {
      const idx = prev.findIndex((c) => c.code === editing.code);
      if (idx >= 0) { const next = [...prev]; next[idx] = editing; return next; }
      return [...prev, { ...editing, code: editing.code.toUpperCase().trim() }];
    });
    setModalOpen(false); setEditing(null);
  }

  function toggleActive(code: string) {
    setCoupons((prev) => prev.map((c) => c.code === code ? { ...c, active: !c.active } : c));
  }

  function remove(code: string) {
    if (!confirm(`"${code}" kuponunu silmek istiyor musunuz?`)) return;
    setCoupons((prev) => prev.filter((c) => c.code !== code));
  }

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Kuponlar</div>
          <div className="adm-page-sub">{coupons.length} kupon · {coupons.filter(c => c.active).length} aktif</div>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={openNew}>+ Yeni Kupon</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        <div className="adm-stat">
          <div className="adm-stat__label">Aktif kupon</div>
          <div className="adm-stat__value">{coupons.filter(c => c.active).length}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat__label">Toplam kullanım</div>
          <div className="adm-stat__value">{coupons.reduce((s, c) => s + c.usageCount, 0)}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat__label">En çok kullanılan</div>
          <div className="adm-stat__value" style={{ fontSize: 16, fontFamily: "var(--adm-mono)" }}>{coupons.sort((a, b) => b.usageCount - a.usageCount)[0]?.code ?? "—"}</div>
        </div>
      </div>

      <div className="adm-card">
        <table className="adm-table">
          <thead>
            <tr><th>Kod</th><th>İndirim</th><th>Kullanım</th><th>Limit</th><th>Bitiş</th><th>Durum</th><th style={{ textAlign: "right" }}>İşlem</th></tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.code}>
                <td>
                  <code style={{ fontFamily: "var(--adm-mono)", fontSize: 13, color: "var(--adm-accent)", background: "var(--adm-accent-dim)", padding: "2px 8px", borderRadius: 4 }}>
                    {c.code}
                  </code>
                </td>
                <td style={{ fontWeight: 500 }}>%{c.discountValue} indirim</td>
                <td style={{ color: "var(--adm-text-2)" }}>{c.usageCount} kez</td>
                <td style={{ color: "var(--adm-text-3)" }}>{c.maxUsage ?? "Sınırsız"}</td>
                <td style={{ color: "var(--adm-text-3)", fontSize: 11 }}>{c.expiresAt ?? "—"}</td>
                <td>
                  <label className="adm-toggle">
                    <input type="checkbox" checked={c.active} onChange={() => toggleActive(c.code)} />
                    <span className="adm-toggle__track" />
                  </label>
                </td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => openEdit(c)}>Düzenle</button>
                    <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => remove(c.code)}>Sil</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && editing && (
        <div className="adm-overlay" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="adm-modal">
            <div className="adm-modal__header">
              <span style={{ fontWeight: 600 }}>{editing.usageCount === 0 && !coupons.find(c => c.code === editing.code) ? "Yeni Kupon" : "Kuponu Düzenle"}</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setModalOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" fill="none"><line x1="2" y1="2" x2="14" y2="14"/><line x1="14" y1="2" x2="2" y2="14"/></svg>
              </button>
            </div>
            <div className="adm-modal__body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="adm-field">
                <label>Kupon Kodu</label>
                <input className="adm-input" value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} placeholder="VENTI10" />
              </div>
              <div className="adm-grid-2">
                <div className="adm-field">
                  <label>İndirim Oranı (%)</label>
                  <input className="adm-input" type="number" min={1} max={100} value={editing.discountValue} onChange={(e) => setEditing({ ...editing, discountValue: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="adm-field">
                  <label>Maks. Kullanım</label>
                  <input className="adm-input" type="number" min={1} value={editing.maxUsage ?? ""} onChange={(e) => setEditing({ ...editing, maxUsage: e.target.value ? parseInt(e.target.value) : undefined })} placeholder="Sınırsız" />
                </div>
              </div>
              <div className="adm-field">
                <label>Bitiş Tarihi</label>
                <input className="adm-input" type="date" value={editing.expiresAt ?? ""} onChange={(e) => setEditing({ ...editing, expiresAt: e.target.value || undefined })} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <label className="adm-toggle">
                  <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />
                  <span className="adm-toggle__track" />
                </label>
                <span style={{ fontSize: 13, color: "var(--adm-text-2)" }}>Kupon aktif</span>
              </div>
            </div>
            <div className="adm-modal__footer">
              <button className="adm-btn adm-btn--secondary" onClick={() => setModalOpen(false)}>İptal</button>
              <button className="adm-btn adm-btn--primary" onClick={save}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
