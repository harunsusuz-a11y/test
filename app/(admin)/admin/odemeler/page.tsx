"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { CreditCard, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

type Payment = {
  id: string; order_id: string; amount: number; currency: string;
  status: string; provider: string; transaction_id: string | null;
  created_at: string;
  orders?: { order_number: string; full_name: string; email: string } | null;
};

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:  { label:"Bekliyor",  color:"#f59e0b", icon:<Clock size={14}/> },
  success:  { label:"Başarılı",  color:"#4ade80", icon:<CheckCircle size={14}/> },
  paid:     { label:"Ödendi",    color:"#4ade80", icon:<CheckCircle size={14}/> },
  failed:   { label:"Başarısız", color:"#f87171", icon:<XCircle size={14}/> },
  refunded: { label:"İade",      color:"#60a5fa", icon:<RefreshCw size={14}/> },
};

export default function OdemelerPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("payments")
      .select("*, orders(order_number,full_name,email)", { count:"exact" })
      .order("created_at", { ascending: false })
      .range((page-1)*LIMIT, page*LIMIT-1);
    if (filter) q = q.eq("status", filter);
    const { data, count } = await q;
    setPayments((data ?? []) as Payment[]);
    setTotal(count ?? 0);
    setLoading(false);
  }, [supabase, filter, page]);

  useEffect(() => { load(); }, [load]);

  const kpi = {
    total: payments.reduce((s,p) => s + Number(p.amount), 0),
    success: payments.filter(p => ["success","paid"].includes(p.status)).length,
    failed: payments.filter(p => p.status === "failed").length,
    refunded: payments.filter(p => p.status === "refunded").length,
  };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <CreditCard size={22} color="#c8a26b" />
        <span style={{ fontSize:22, fontWeight:700, color:"var(--adm-text)" }}>Ödeme Yönetimi</span>
      </div>

      {/* KPI */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Toplam Tutar", value:`₺${kpi.total.toFixed(2)}`, color:"#c8a26b" },
          { label:"Başarılı", value:kpi.success, color:"#4ade80" },
          { label:"Başarısız", value:kpi.failed, color:"#f87171" },
          { label:"İade", value:kpi.refunded, color:"#60a5fa" },
        ].map((k,i) => (
          <div key={i} style={{ background:"var(--adm-surface)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:16 }}>
            <div style={{ fontSize:22, fontWeight:700, color:k.color }}>{k.value}</div>
            <div style={{ fontSize:13, color:"var(--adm-text-muted)", marginTop:4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filtreler */}
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {["","pending","success","paid","failed","refunded"].map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }}
            style={{ padding:"6px 14px", borderRadius:6, border: filter===s ? "1px solid #c8a26b":"1px solid rgba(255,255,255,0.1)",
              background: filter===s ? "rgba(200,162,107,0.1)":"transparent",
              color: filter===s ? "#c8a26b":"var(--adm-text-muted)", cursor:"pointer", fontSize:13 }}>
            {s === "" ? "Tümü" : STATUS_MAP[s]?.label ?? s}
          </button>
        ))}
      </div>

      {/* Tablo */}
      <div style={{ background:"var(--adm-surface)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"rgba(255,255,255,0.03)" }}>
              {["Sipariş","Müşteri","Tutar","Sağlayıcı","Transaction ID","Durum","Tarih"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"12px 16px", fontSize:12, color:"var(--adm-text-muted)", fontWeight:500, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:"var(--adm-text-muted)" }}>Yükleniyor…</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:"var(--adm-text-muted)" }}>Ödeme bulunamadı.</td></tr>
            ) : payments.map(p => {
              const st = STATUS_MAP[p.status] ?? { label:p.status, color:"var(--adm-text-muted)", icon:null };
              return (
                <tr key={p.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"12px 16px", fontSize:13, color:"#c8a26b" }}>{p.orders?.order_number ?? "-"}</td>
                  <td style={{ padding:"12px 16px", fontSize:13, color:"var(--adm-text)" }}>
                    <div>{p.orders?.full_name ?? "-"}</div>
                    <div style={{ fontSize:11, color:"var(--adm-text-muted)" }}>{p.orders?.email}</div>
                  </td>
                  <td style={{ padding:"12px 16px", fontSize:13, fontWeight:600, color:"var(--adm-text)" }}>₺{Number(p.amount).toFixed(2)}</td>
                  <td style={{ padding:"12px 16px", fontSize:13, color:"var(--adm-text-muted)" }}>{p.provider ?? "PayTR"}</td>
                  <td style={{ padding:"12px 16px" }}>
                    <code style={{ fontSize:11, color:"var(--adm-text-muted)" }}>{p.transaction_id ?? "-"}</code>
                  </td>
                  <td style={{ padding:"12px 16px" }}>
                    <span style={{ display:"flex", alignItems:"center", gap:4, color:st.color, fontSize:12, fontWeight:600 }}>
                      {st.icon}{st.label}
                    </span>
                  </td>
                  <td style={{ padding:"12px 16px", fontSize:12, color:"var(--adm-text-muted)" }}>
                    {new Date(p.created_at).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > LIMIT && (
        <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:16 }}>
          <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
            style={{ padding:"6px 14px", borderRadius:6, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color: page===1 ? "#3a3a45":"var(--adm-text-muted)", cursor: page===1 ? "not-allowed":"pointer" }}>
            ← Önceki
          </button>
          <span style={{ padding:"6px 14px", color:"var(--adm-text-muted)", fontSize:13 }}>{page} / {Math.ceil(total/LIMIT)}</span>
          <button onClick={() => setPage(p => p+1)} disabled={page*LIMIT >= total}
            style={{ padding:"6px 14px", borderRadius:6, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color: page*LIMIT>=total ? "#3a3a45":"var(--adm-text-muted)", cursor: page*LIMIT>=total ? "not-allowed":"pointer" }}>
            Sonraki →
          </button>
        </div>
      )}
    </div>
  );
}
