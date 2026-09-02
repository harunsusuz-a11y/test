"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DollarSign, TrendingUp, TrendingDown, Download } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type FinTx = { id:string; type:string; amount:number; description:string|null; created_at:string; order_id:string|null };

const TYPE_LABELS: Record<string,string> = {
  sale:"Satış", refund:"İade", commission:"Komisyon",
  shipping:"Kargo", tax:"Vergi", discount:"İndirim", adjustment:"Düzeltme"
};
const TYPE_COLORS: Record<string,string> = {
  sale:"#4ade80", refund:"#f87171", commission:"#f59e0b",
  shipping:"#60a5fa", tax:"#a78bfa", discount:"#f87171", adjustment:"var(--adm-text-muted)"
};

export default function FinansPage() {
  const [txs, setTxs] = useState<FinTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30");
  const [chartData, setChartData] = useState<{date:string;gelir:number;gider:number}[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const from = new Date(Date.now() - parseInt(range)*86400000).toISOString();

      const [txRes, ordersRes] = await Promise.all([
        supabase.from("financial_transactions").select("*").gte("created_at", from).order("created_at", { ascending:false }),
        supabase.from("orders").select("total,created_at,status").gte("created_at", from),
      ]);

      setTxs((txRes.data ?? []) as FinTx[]);

      // Günlük gelir/gider grafiği
      const orders = ordersRes.data ?? [];
      const byDay: Record<string,{gelir:number;gider:number}> = {};
      orders.forEach(o => {
        const d = o.created_at.slice(0,10);
        if (!byDay[d]) byDay[d] = { gelir:0, gider:0 };
        if (o.status === "delivered") byDay[d].gelir += Number(o.total);
        if (o.status === "cancelled") byDay[d].gider += Number(o.total);
      });
      setChartData(Object.entries(byDay).sort((a,b) => a[0].localeCompare(b[0])).map(([date,v]) => ({ date, ...v })));
      setLoading(false);
    }
    load();
  }, [range, supabase]);

  const totalsBase = txs.reduce((acc, t) => {
    if (["sale"].includes(t.type)) acc.revenue += Number(t.amount);
    if (["refund","commission","shipping"].includes(t.type)) acc.expenses += Number(t.amount);
    return acc;
  }, { revenue:0, expenses:0 });
  const totals = { ...totalsBase, net: totalsBase.revenue - totalsBase.expenses };

  function exportCSV() {
    const rows = ["Tür,Tutar,Açıklama,Tarih",
      ...txs.map(t => `${TYPE_LABELS[t.type]??t.type},${t.amount},${t.description??"-"},${new Date(t.created_at).toLocaleDateString("tr-TR")}`)
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows], { type:"text/csv;charset=utf-8" }));
    a.download = `finans_${range}gun.csv`; a.click();
  }

  const cardStyle: React.CSSProperties = { background:"var(--adm-surface)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:20 };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <DollarSign size={22} color="#c8a26b" />
          <span style={{ fontSize:22, fontWeight:700, color:"var(--adm-text)" }}>Finans & Muhasebe</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {["7","30","90","365"].map(r => (
            <button key={r} onClick={() => setRange(r)}
              style={{ padding:"6px 12px", borderRadius:6, border: range===r ? "1px solid #c8a26b":"1px solid rgba(255,255,255,0.1)",
                background: range===r ? "rgba(200,162,107,0.1)":"transparent",
                color: range===r ? "#c8a26b":"var(--adm-text-muted)", cursor:"pointer", fontSize:13 }}>
              {r}g
            </button>
          ))}
          <button onClick={exportCSV}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:6, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"var(--adm-text-muted)", cursor:"pointer", fontSize:13 }}>
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        <div style={cardStyle}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <TrendingUp size={16} color="#4ade80" />
            <span style={{ fontSize:13, color:"var(--adm-text-muted)" }}>Toplam Gelir</span>
          </div>
          <div style={{ fontSize:26, fontWeight:700, color:"#4ade80" }}>₺{totals.revenue.toFixed(2)}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <TrendingDown size={16} color="#f87171" />
            <span style={{ fontSize:13, color:"var(--adm-text-muted)" }}>Toplam Gider</span>
          </div>
          <div style={{ fontSize:26, fontWeight:700, color:"#f87171" }}>₺{totals.expenses.toFixed(2)}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <DollarSign size={16} color="#c8a26b" />
            <span style={{ fontSize:13, color:"var(--adm-text-muted)" }}>Net Kâr</span>
          </div>
          <div style={{ fontSize:26, fontWeight:700, color: totals.net >= 0 ? "#4ade80":"#f87171" }}>
            ₺{totals.net.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Grafik */}
      {!loading && chartData.length > 0 && (
        <div style={{ ...cardStyle, marginBottom:24 }}>
          <p style={{ fontSize:15, fontWeight:600, color:"var(--adm-text)", marginBottom:16 }}>Gelir / Gider Trendi</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gelir" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gider" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
              <XAxis dataKey="date" tick={{ fill:"var(--adm-text-muted)", fontSize:11 }} />
              <YAxis tick={{ fill:"var(--adm-text-muted)", fontSize:11 }} />
              <Tooltip contentStyle={{ background:"var(--adm-surface)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8 }} />
              <Area type="monotone" dataKey="gelir" stroke="#4ade80" fill="url(#gelir)" name="Gelir (₺)" />
              <Area type="monotone" dataKey="gider" stroke="#f87171" fill="url(#gider)" name="Gider (₺)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* İşlem Geçmişi */}
      <div style={cardStyle}>
        <p style={{ fontSize:15, fontWeight:600, color:"var(--adm-text)", marginBottom:16 }}>İşlem Geçmişi</p>
        {loading ? <p style={{ color:"var(--adm-text-muted)" }}>Yükleniyor…</p> : txs.length === 0 ? (
          <p style={{ color:"var(--adm-text-muted)", textAlign:"center", padding:"20px 0" }}>İşlem bulunamadı.</p>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                {["Tür","Tutar","Açıklama","Tarih"].map(h => (
                  <th key={h} style={{ textAlign:"left", padding:"8px 12px", fontSize:12, color:"var(--adm-text-muted)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txs.slice(0,50).map(t => (
                <tr key={t.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"10px 12px" }}>
                    <span style={{ fontSize:12, fontWeight:600, color: TYPE_COLORS[t.type] ??"var(--adm-text-muted)",
                      background:`${(TYPE_COLORS[t.type] ??"var(--adm-text-muted)")}18`, padding:"2px 8px", borderRadius:4 }}>
                      {TYPE_LABELS[t.type] ?? t.type}
                    </span>
                  </td>
                  <td style={{ padding:"10px 12px", fontSize:13, fontWeight:600, color: ["sale"].includes(t.type) ? "#4ade80":"#f87171" }}>
                    {["sale"].includes(t.type) ? "+" : "-"}₺{Number(t.amount).toFixed(2)}
                  </td>
                  <td style={{ padding:"10px 12px", fontSize:13, color:"var(--adm-text-muted)" }}>{t.description ?? "-"}</td>
                  <td style={{ padding:"10px 12px", fontSize:12, color:"var(--adm-text-muted)" }}>
                    {new Date(t.created_at).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
