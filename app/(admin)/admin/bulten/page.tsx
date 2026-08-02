"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Subscriber {
  id: string; email: string; status: string; source: string | null;
  tags: string[] | null; created_at: string;
}

export default function AdminBulten() {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    setSubs((data as Subscriber[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    await supabase.from("newsletter_subscribers").update({ status }).eq("id", id);
    setSubs(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  }

  const filtered = subs.filter(s => {
    const ms = filter === "all" || s.status === filter;
    const mq = !search || s.email.toLowerCase().includes(search.toLowerCase());
    return ms && mq;
  });

  const activeCount = subs.filter(s => s.status === "active").length;

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Bülten Aboneleri</div>
          <div className="adm-page-sub">{subs.length} abone · {activeCount} aktif</div>
        </div>
        <button className="adm-btn adm-btn--secondary" onClick={() => {
          const csv = ["Email,Durum,Kaynak,Tarih", ...filtered.map(s => `${s.email},${s.status},${s.source||""},${new Date(s.created_at).toLocaleDateString("tr-TR")}`)].join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "bulten-aboneleri.csv"; a.click();
        }}>↓ CSV İndir</button>
      </div>

      <div className="adm-kpi-grid" style={{ marginBottom: 20 }}>
        {[
          { label: "Aktif",     value: subs.filter(s=>s.status==="active").length,      color: "var(--adm-green)" },
          { label: "Pasif",     value: subs.filter(s=>s.status==="unsubscribed").length, color: "var(--adm-text-3)" },
          { label: "Engellendi",value: subs.filter(s=>s.status==="bounced").length,      color: "var(--adm-red)" },
          { label: "Toplam",    value: subs.length,                                      color: "var(--adm-text)" },
        ].map((k, i) => (
          <div key={i} className="adm-stat">
            <div className="adm-stat__label">{k.label}</div>
            <div className="adm-stat__value" style={{ fontSize: 22, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div className="adm-tabs">
          {[["all","Tümü"],["active","Aktif"],["unsubscribed","Çıktı"],["bounced","Bounced"]].map(([k,l]) => (
            <button key={k} className={`adm-tab${filter===k?" active":""}`} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
        <div className="adm-search" style={{ flex: 1, maxWidth: 300 }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/></svg>
          <input className="adm-input" placeholder="E-posta ara…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="adm-card">
        {loading ? <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div> : (
          <table className="adm-table">
            <thead><tr><th>E-posta</th><th>Kaynak</th><th>Etiketler</th><th>Kayıt</th><th>Durum</th><th /></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td className="adm-td--strong">{s.email}</td>
                  <td className="adm-text-muted">{s.source || "—"}</td>
                  <td>{s.tags?.map(t => <span key={t} className="adm-badge adm-badge--muted" style={{ marginRight: 3, fontSize: 9 }}>{t}</span>) || "—"}</td>
                  <td style={{ fontSize: 11, color: "var(--adm-text-4)" }}>{new Date(s.created_at).toLocaleDateString("tr-TR")}</td>
                  <td>
                    <span className={`adm-badge ${s.status==="active"?"adm-badge--green":s.status==="bounced"?"adm-badge--red":"adm-badge--muted"}`}>
                      {s.status==="active"?"Aktif":s.status==="unsubscribed"?"Çıktı":"Bounced"}
                    </span>
                  </td>
                  <td>
                    {s.status === "active"
                      ? <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => updateStatus(s.id,"unsubscribed")}>Çıkar</button>
                      : <button className="adm-btn adm-btn--secondary adm-btn--sm" onClick={() => updateStatus(s.id,"active")}>Aktifleştir</button>
                    }
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6}><div className="adm-empty"><div className="adm-empty__title">Abone bulunamadı</div></div></td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
