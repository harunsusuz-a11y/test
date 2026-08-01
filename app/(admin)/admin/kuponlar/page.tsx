"use client";
import React, { useState } from "react";

interface Coupon {
  id: number; code: string; type: "percent" | "fixed";
  value: number; minOrder: number; usageLimit: number;
  used: number; active: boolean; expires: string;
}

const INIT: Coupon[] = [
  { id: 1, code: "VENTI10", type: "percent", value: 10, minOrder: 0,   usageLimit: 100, used: 47, active: true,  expires: "31 Ara 2026" },
  { id: 2, code: "ILK20",   type: "percent", value: 20, minOrder: 150, usageLimit: 50,  used: 12, active: true,  expires: "31 Ağu 2026" },
  { id: 3, code: "UCRETES", type: "fixed",   value: 30, minOrder: 200, usageLimit: 200, used: 89, active: false, expires: "30 Tem 2026" },
];

const EMPTY: Omit<Coupon, "id" | "used"> = { code: "", type: "percent", value: 10, minOrder: 0, usageLimit: 100, active: true, expires: "" };

export default function AdminKuponlar() {
  const [coupons, setCoupons] = useState<Coupon[]>(INIT);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Omit<Coupon, "id" | "used">>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);

  function openNew() { setEditing(EMPTY); setEditId(null); setOpen(true); }
  function openEdit(c: Coupon) {
    const { id, used, ...rest } = c; void id; void used;
    setEditing(rest); setEditId(c.id); setOpen(true);
  }
  function save() {
    if (!editing.code) return;
    if (editId !== null) {
      setCoupons(prev => prev.map(c => c.id === editId ? { ...c, ...editing } : c));
    } else {
      setCoupons(prev => [...prev, { ...editing, id: Date.now(), used: 0 }]);
    }
    setOpen(false);
  }
  function toggle(id: number) { setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c)); }
  function remove(id: number) { if (confirm("Kupon silinsin mi?")) setCoupons(prev => prev.filter(c => c.id !== id)); }

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
      <div className="adm-kpi-grid--3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        <MiniStat label="Toplam Kullanım" value={String(coupons.reduce((s, c) => s + c.used, 0))} />
        <MiniStat label="Aktif Kupon"     value={String(coupons.filter(c => c.active).length)} />
        <MiniStat label="Tahmini Tasarruf" value={`₺${coupons.reduce((s, c) => s + (c.type === "fixed" ? c.value * c.used : 0), 0).toFixed(0)}`} />
      </div>

      <div className="adm-card">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Kod</th>
              <th>İndirim</th>
              <th>Min. Sepet</th>
              <th>Kullanım</th>
              <th>Son Tarih</th>
              <th>Durum</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id}>
                <td>
                  <span style={{
                    fontFamily: "var(--adm-mono)", fontSize: 13, fontWeight: 600,
                    color: "var(--adm-accent)", background: "var(--adm-accent-dim)",
                    padding: "2px 8px", borderRadius: 4, letterSpacing: "0.05em",
                  }}>{c.code}</span>
                </td>
                <td className="adm-td--strong">
                  {c.type === "percent" ? `%${c.value}` : `₺${c.value}`}
                </td>
                <td className="adm-text-muted">{c.minOrder > 0 ? `₺${c.minOrder}+` : "—"}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--adm-text-2)", minWidth: 32 }}>{c.used}/{c.usageLimit}</span>
                    <div style={{ flex: 1, minWidth: 60 }}>
                      <div className="adm-progress">
                        <div className="adm-progress-bar" style={{ width: `${Math.min(100, (c.used / c.usageLimit) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="adm-text-muted">{c.expires || "—"}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className={`adm-toggle${c.active ? " on" : ""}`} onClick={() => toggle(c.id)} />
                    <span style={{ fontSize: 11, color: "var(--adm-text-3)" }}>{c.active ? "Aktif" : "Pasif"}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => openEdit(c)}>Düzenle</button>
                    <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => remove(c.id)}>Sil</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="adm-overlay" onClick={() => setOpen(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">{editId ? "Kuponu Düzenle" : "Yeni Kupon"}</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field">
                <label className="adm-label-text">Kupon Kodu</label>
                <input className="adm-input" style={{ fontFamily: "var(--adm-mono)", textTransform: "uppercase", fontWeight: 600 }}
                  value={editing.code} onChange={e => setEditing({ ...editing, code: e.target.value.toUpperCase() })} placeholder="VENTI10" />
              </div>
              <div className="adm-field-row">
                <div className="adm-field">
                  <label className="adm-label-text">İndirim Tipi</label>
                  <select className="adm-select" value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value as Coupon["type"] })}>
                    <option value="percent">Yüzde (%)</option>
                    <option value="fixed">Sabit (₺)</option>
                  </select>
                </div>
                <div className="adm-field">
                  <label className="adm-label-text">İndirim Değeri</label>
                  <input className="adm-input" type="number" value={editing.value} onChange={e => setEditing({ ...editing, value: Number(e.target.value) })} />
                </div>
              </div>
              <div className="adm-field-row">
                <div className="adm-field">
                  <label className="adm-label-text">Min. Sipariş (₺)</label>
                  <input className="adm-input" type="number" value={editing.minOrder} onChange={e => setEditing({ ...editing, minOrder: Number(e.target.value) })} />
                </div>
                <div className="adm-field">
                  <label className="adm-label-text">Kullanım Limiti</label>
                  <input className="adm-input" type="number" value={editing.usageLimit} onChange={e => setEditing({ ...editing, usageLimit: Number(e.target.value) })} />
                </div>
              </div>
              <div className="adm-field">
                <label className="adm-label-text">Son Kullanma Tarihi</label>
                <input className="adm-input" type="date" value={editing.expires} onChange={e => setEditing({ ...editing, expires: e.target.value })} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className={`adm-toggle${editing.active ? " on" : ""}`} onClick={() => setEditing({ ...editing, active: !editing.active })} />
                <span style={{ fontSize: 12, color: "var(--adm-text-2)" }}>Kupon aktif</span>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn--secondary" onClick={() => setOpen(false)}>İptal</button>
              <button className="adm-btn adm-btn--primary" onClick={save}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="adm-stat">
      <div className="adm-stat__label">{label}</div>
      <div className="adm-stat__value" style={{ fontSize: 22 }}>{value}</div>
    </div>
  );
}
