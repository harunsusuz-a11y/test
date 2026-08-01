"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  id: string; first_name: string | null; last_name: string | null;
  email: string; phone: string | null; status: string; user_type: string;
  loyalty_points: number | null; total_orders: number | null; total_spent: number | null;
  last_login_at: string | null; created_at: string; marketing_consent: boolean | null;
}

export default function AdminMusteriler() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_type", "customer")
      .order("created_at", { ascending: false });
    setCustomers((data as Profile[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function toggleStatus(id: string, status: string) {
    const next = status === "active" ? "inactive" : "active";
    await supabase.from("profiles").update({ status: next }).eq("id", id);
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: next } : c));
    if (selected?.id === id) setSelected({ ...selected, status: next });
  }

  function fullName(c: Profile) {
    return [c.first_name, c.last_name].filter(Boolean).join(" ") || "—";
  }

  const filtered = customers.filter(c => {
    const ms = statusFilter === "all" || c.status === statusFilter;
    const q = search.toLowerCase();
    const mq = !q || c.email.toLowerCase().includes(q) || fullName(c).toLowerCase().includes(q);
    return ms && mq;
  });

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Müşteriler</div>
          <div className="adm-page-sub">{customers.length} müşteri</div>
        </div>
        <button className="adm-btn adm-btn--secondary">↓ Dışa Aktar</button>
      </div>

      {/* KPI */}
      <div className="adm-kpi-grid" style={{ marginBottom: 20 }}>
        {[
          { label: "Toplam Müşteri", value: customers.length, color: "var(--adm-text)" },
          { label: "Aktif",          value: customers.filter(c => c.status === "active").length,   color: "var(--adm-green)" },
          { label: "Pasif",          value: customers.filter(c => c.status === "inactive").length, color: "var(--adm-yellow)" },
          { label: "Engellenen",     value: customers.filter(c => c.status === "banned").length,   color: "var(--adm-red)" },
        ].map((k, i) => (
          <div key={i} className="adm-stat">
            <div className="adm-stat__label">{k.label}</div>
            <div className="adm-stat__value" style={{ fontSize: 22, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filtreler */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div className="adm-tabs">
          {[["all","Tümü"],["active","Aktif"],["inactive","Pasif"],["banned","Engellenen"]].map(([k,l]) => (
            <button key={k} className={`adm-tab${statusFilter===k?" active":""}`} onClick={() => setStatusFilter(k)}>{l}</button>
          ))}
        </div>
        <div className="adm-search" style={{ flex: 1, maxWidth: 300 }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/></svg>
          <input className="adm-input" placeholder="Ad, e-posta ile ara…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="adm-card">
        {loading ? <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div> : (
          <table className="adm-table">
            <thead><tr><th>Müşteri</th><th>E-posta</th><th>Sipariş</th><th>Toplam</th><th>Puan</th><th>Son Giriş</th><th>Durum</th><th /></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => setSelected(c)}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--adm-surface-3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--adm-accent)", flexShrink: 0 }}>
                        {(c.first_name || c.email)[0].toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 500, color: "var(--adm-text)" }}>{fullName(c)}</div>
                    </div>
                  </td>
                  <td className="adm-text-muted">{c.email}</td>
                  <td className="adm-mono">{c.total_orders ?? 0}</td>
                  <td className="adm-mono adm-text-accent">₺{(c.total_spent || 0).toLocaleString("tr-TR")}</td>
                  <td className="adm-mono">{c.loyalty_points ?? 0}</td>
                  <td style={{ fontSize: 11, color: "var(--adm-text-4)" }}>
                    {c.last_login_at ? new Date(c.last_login_at).toLocaleDateString("tr-TR") : "—"}
                  </td>
                  <td>
                    <span className={`adm-badge ${c.status === "active" ? "adm-badge--green" : c.status === "banned" ? "adm-badge--red" : "adm-badge--muted"}`}>
                      {c.status === "active" ? "Aktif" : c.status === "banned" ? "Engelli" : "Pasif"}
                    </span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <button
                      className={`adm-btn adm-btn--sm ${c.status === "active" ? "adm-btn--danger" : "adm-btn--secondary"}`}
                      onClick={() => toggleStatus(c.id, c.status)}
                    >
                      {c.status === "active" ? "Devre Dışı" : "Aktifleştir"}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8}><div className="adm-empty"><div className="adm-empty__title">Müşteri bulunamadı</div></div></td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Drawer */}
      {selected && (
        <>
          <div className="adm-overlay" style={{ justifyContent:"flex-end", padding:0, alignItems:"stretch" }} onClick={() => setSelected(null)} />
          <div className="adm-drawer">
            <div className="adm-drawer-header">
              <div>
                <div style={{ fontSize:15, fontWeight:600, color:"var(--adm-text)" }}>{fullName(selected)}</div>
                <div style={{ fontSize:11, color:"var(--adm-text-3)", marginTop:2 }}>{selected.email}</div>
              </div>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="adm-drawer-body">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
                {[
                  { label:"Sipariş",  value: selected.total_orders ?? 0 },
                  { label:"Harcama",  value: `₺${(selected.total_spent||0).toLocaleString("tr-TR")}` },
                  { label:"Puan",     value: selected.loyalty_points ?? 0 },
                ].map((k,i) => (
                  <div key={i} className="adm-stat">
                    <div className="adm-stat__label">{k.label}</div>
                    <div className="adm-stat__value" style={{ fontSize:18 }}>{k.value}</div>
                  </div>
                ))}
              </div>

              <div className="adm-card" style={{ marginBottom:12 }}>
                <div className="adm-card-header"><span className="adm-card-title">Bilgiler</span></div>
                <div className="adm-card-body">
                  {[
                    ["Ad", selected.first_name || "—"],
                    ["Soyad", selected.last_name || "—"],
                    ["E-posta", selected.email],
                    ["Telefon", selected.phone || "—"],
                    ["Kayıt", new Date(selected.created_at).toLocaleDateString("tr-TR")],
                    ["Son Giriş", selected.last_login_at ? new Date(selected.last_login_at).toLocaleDateString("tr-TR") : "—"],
                    ["Durum", selected.status],
                    ["E-posta İzni", selected.marketing_consent ? "Evet" : "Hayır"],
                  ].map(([k,v]) => (
                    <div key={k} style={{ display:"flex", gap:8, marginBottom:7 }}>
                      <span style={{ fontSize:11, color:"var(--adm-text-4)", width:80, flexShrink:0 }}>{k}</span>
                      <span style={{ fontSize:12, color:"var(--adm-text-2)" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display:"flex", gap:8 }}>
                <button
                  className={`adm-btn ${selected.status === "active" ? "adm-btn--danger" : "adm-btn--secondary"}`}
                  onClick={() => toggleStatus(selected.id, selected.status)}
                >
                  {selected.status === "active" ? "Devre Dışı Bırak" : selected.status === "banned" ? "Engeli Kaldır" : "Aktifleştir"}
                </button>
                <button
                  className="adm-btn adm-btn--danger"
                  onClick={() => { supabase.from("profiles").update({ status: "banned" }).eq("id", selected.id); setSelected({ ...selected, status: "banned" }); setCustomers(prev => prev.map(c => c.id === selected.id ? { ...c, status: "banned" } : c)); }}
                >
                  Engelle
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
