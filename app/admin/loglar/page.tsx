"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Log { id: string; actor_email: string | null; action: string; entity_type: string; entity_id: string | null; old_values: any; new_values: any; request_ip: string | null; created_at: string; }

export default function AdminLoglar() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Log | null>(null);
  const [page, setPage] = useState(0);
  const PER_PAGE = 50;
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("admin_activity_logs").select("*")
      .order("created_at", { ascending: false })
      .range(page * PER_PAGE, (page + 1) * PER_PAGE - 1);
    setLogs((data as Log[]) || []);
    setLoading(false);
  }, [supabase, page]);

  useEffect(() => { load(); }, [load]);

  const ACTION_COLORS: Record<string, string> = {
    INSERT: "var(--adm-green)", UPDATE: "var(--adm-blue)",
    DELETE: "var(--adm-red)", LOGIN: "var(--adm-accent)",
  };

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">Sistem Logları</div><div className="adm-page-sub">Admin işlem geçmişi</div></div>
        <button className="adm-btn adm-btn--secondary" onClick={load}>↻ Yenile</button>
      </div>

      <div className="adm-card">
        {loading ? <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div> : (
          <>
            <table className="adm-table">
              <thead><tr><th>Tarih</th><th>Kullanıcı</th><th>İşlem</th><th>Tablo</th><th>Kayıt ID</th><th>IP</th><th /></tr></thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ cursor: "pointer" }} onClick={() => setSelected(log)}>
                    <td className="adm-mono adm-text-muted" style={{ fontSize: 11 }}>{new Date(log.created_at).toLocaleString("tr-TR")}</td>
                    <td style={{ fontSize: 11, color: "var(--adm-text-2)" }}>{log.actor_email || "—"}</td>
                    <td>
                      <span className="adm-badge" style={{ background: `${ACTION_COLORS[log.action] || "var(--adm-text-3)"}20`, color: ACTION_COLORS[log.action] || "var(--adm-text-3)" }}>
                        {log.action}
                      </span>
                    </td>
                    <td className="adm-mono adm-text-muted" style={{ fontSize: 11 }}>{log.entity_type}</td>
                    <td className="adm-mono adm-text-muted" style={{ fontSize: 10 }}>{log.entity_id?.slice(0, 8) || "—"}…</td>
                    <td style={{ fontSize: 11, color: "var(--adm-text-4)" }}>{log.request_ip || "—"}</td>
                    <td><button className="adm-btn adm-btn--ghost adm-btn--sm">Detay</button></td>
                  </tr>
                ))}
                {logs.length === 0 && <tr><td colSpan={7}><div className="adm-empty"><div className="adm-empty__title">Log bulunamadı</div></div></td></tr>}
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", borderTop: "1px solid var(--adm-border)" }}>
              <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}>← Önceki</button>
              <span style={{ fontSize: 12, color: "var(--adm-text-3)" }}>Sayfa {page + 1}</span>
              <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setPage(p => p+1)} disabled={logs.length < PER_PAGE}>Sonraki →</button>
            </div>
          </>
        )}
      </div>

      {selected && (
        <div className="adm-overlay" onClick={() => setSelected(null)}>
          <div className="adm-modal adm-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">Log Detayı</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              {[["Tarih", new Date(selected.created_at).toLocaleString("tr-TR")], ["Kullanıcı", selected.actor_email||"—"], ["İşlem", selected.action], ["Tablo", selected.entity_type], ["Kayıt ID", selected.entity_id||"—"], ["IP", selected.request_ip||"—"]].map(([k,v]) => (
                <div key={k} style={{ display:"flex", gap:12, marginBottom:8, alignItems:"flex-start" }}>
                  <span style={{ fontSize:11, color:"var(--adm-text-4)", width:80, flexShrink:0 }}>{k}</span>
                  <span style={{ fontSize:12, color:"var(--adm-text-2)", fontFamily: k==="Kayıt ID"||k==="IP" ? "var(--adm-mono)" : undefined }}>{v}</span>
                </div>
              ))}
              {selected.old_values && (
                <div className="adm-field" style={{ marginTop:12 }}>
                  <label className="adm-label-text">Eski Değer</label>
                  <pre style={{ fontSize:11, color:"var(--adm-red)", background:"var(--adm-surface-2)", padding:10, borderRadius:6, overflow:"auto", maxHeight:200 }}>{JSON.stringify(selected.old_values, null, 2)}</pre>
                </div>
              )}
              {selected.new_values && (
                <div className="adm-field">
                  <label className="adm-label-text">Yeni Değer</label>
                  <pre style={{ fontSize:11, color:"var(--adm-green)", background:"var(--adm-surface-2)", padding:10, borderRadius:6, overflow:"auto", maxHeight:200 }}>{JSON.stringify(selected.new_values, null, 2)}</pre>
                </div>
              )}
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn--secondary" onClick={() => setSelected(null)}>Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
