"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Customer {
  id: string; group_name: string; loyalty_points: number;
  total_spent: number; order_count: number; is_blocked: boolean;
  created_at: string;
  profile: { first_name: string; last_name: string; email: string; phone: string | null; status: string } | null;
}

export default function AdminMusteriler() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("customers")
      .select("*, profile:id(first_name, last_name, email, phone, status)")
      .order("created_at", { ascending: false });
    setCustomers((data as Customer[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function toggleBlock(id: string, val: boolean) {
    await supabase.from("customers").update({ is_blocked: val }).eq("id", id);
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, is_blocked: val } : c));
  }

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const p = c.profile;
    return !q || (p?.email?.toLowerCase().includes(q)) ||
      (`${p?.first_name} ${p?.last_name}`).toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">Müşteriler</div><div className="adm-page-sub">{customers.length} müşteri</div></div>
        <button className="adm-btn adm-btn--secondary">↓ Dışa Aktar</button>
      </div>

      <div className="adm-kpi-grid" style={{ marginBottom: 20 }}>
        {[
          { label: "Toplam Müşteri", value: customers.length },
          { label: "Aktif", value: customers.filter(c => !c.is_blocked).length },
          { label: "Engellenen", value: customers.filter(c => c.is_blocked).length },
          { label: "Toplam Harcama", value: `₺${customers.reduce((s,c) => s + (c.total_spent||0), 0).toLocaleString("tr-TR")}` },
        ].map((k, i) => (
          <div key={i} className="adm-stat">
            <div className="adm-stat__label">{k.label}</div>
            <div className="adm-stat__value" style={{ fontSize: 22 }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="adm-search" style={{ maxWidth: 340 }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/></svg>
          <input className="adm-input" placeholder="Ad, e-posta ile ara…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="adm-card">
        {loading ? <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div> : (
          <table className="adm-table">
            <thead><tr><th>Müşteri</th><th>E-posta</th><th>Sipariş</th><th>Toplam</th><th>Puan</th><th>Durum</th><th /></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => setSelected(c)}>
                  <td className="adm-td--strong">
                    {c.profile ? `${c.profile.first_name} ${c.profile.last_name}` : "—"}
                  </td>
                  <td className="adm-text-muted">{c.profile?.email || "—"}</td>
                  <td className="adm-mono">{c.order_count}</td>
                  <td className="adm-mono adm-text-accent">₺{(c.total_spent||0).toLocaleString("tr-TR")}</td>
                  <td className="adm-mono">{c.loyalty_points}</td>
                  <td>
                    <span className={`adm-badge ${c.is_blocked ? "adm-badge--red" : "adm-badge--green"}`}>
                      {c.is_blocked ? "Engelli" : "Aktif"}
                    </span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <button
                      className={`adm-btn adm-btn--sm ${c.is_blocked ? "adm-btn--secondary" : "adm-btn--danger"}`}
                      onClick={() => toggleBlock(c.id, !c.is_blocked)}
                    >
                      {c.is_blocked ? "Engeli Kaldır" : "Engelle"}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7}><div className="adm-empty"><div className="adm-empty__title">Müşteri bulunamadı</div></div></td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Drawer */}
      {selected && (
        <>
          <div className="adm-overlay" style={{ justifyContent: "flex-end", padding: 0, alignItems: "stretch" }} onClick={() => setSelected(null)} />
          <div className="adm-drawer">
            <div className="adm-drawer-header">
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--adm-text)" }}>
                  {selected.profile ? `${selected.profile.first_name} ${selected.profile.last_name}` : "Müşteri"}
                </div>
                <div style={{ fontSize: 11, color: "var(--adm-text-3)", marginTop: 2 }}>{selected.profile?.email}</div>
              </div>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="adm-drawer-body">
              <div className="adm-kpi-grid--3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                <div className="adm-stat"><div className="adm-stat__label">Sipariş</div><div className="adm-stat__value" style={{ fontSize: 20 }}>{selected.order_count}</div></div>
                <div className="adm-stat"><div className="adm-stat__label">Harcama</div><div className="adm-stat__value" style={{ fontSize: 18 }}>₺{(selected.total_spent||0).toLocaleString("tr-TR")}</div></div>
                <div className="adm-stat"><div className="adm-stat__label">Puan</div><div className="adm-stat__value" style={{ fontSize: 20 }}>{selected.loyalty_points}</div></div>
              </div>
              <div className="adm-card" style={{ marginBottom: 12 }}>
                <div className="adm-card-header"><span className="adm-card-title">Bilgiler</span></div>
                <div className="adm-card-body">
                  {[
                    ["Ad Soyad", selected.profile ? `${selected.profile.first_name} ${selected.profile.last_name}` : "—"],
                    ["E-posta", selected.profile?.email || "—"],
                    ["Telefon", selected.profile?.phone || "—"],
                    ["Grup", selected.group_name],
                    ["Kayıt", new Date(selected.created_at).toLocaleDateString("tr-TR")],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: "var(--adm-text-4)", width: 70, flexShrink: 0 }}>{label}</span>
                      <span style={{ fontSize: 12, color: "var(--adm-text-2)" }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  className={`adm-btn ${selected.is_blocked ? "adm-btn--secondary" : "adm-btn--danger"}`}
                  onClick={() => { toggleBlock(selected.id, !selected.is_blocked); setSelected({ ...selected, is_blocked: !selected.is_blocked }); }}
                >
                  {selected.is_blocked ? "Engeli Kaldır" : "Hesabı Engelle"}
                </button>
              </div>
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
