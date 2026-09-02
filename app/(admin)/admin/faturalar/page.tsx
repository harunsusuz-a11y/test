"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/ui/Toast";
import { SkeletonTable } from "@/components/admin/ui/Skeleton";
import { FileText, Download, Eye, CheckCircle, Clock, XCircle } from "lucide-react";

type Invoice = {
  id: string; order_id: string | null; invoice_number: string | null;
  amount: number; tax_amount: number | null; status: string;
  type: string | null; issued_at: string | null;  created_at: string;
  orders?: { order_number: string; full_name: string; email: string } | null;
};

const STATUS_COLORS: Record<string,string> = { draft:"var(--adm-text-muted)", issued:"#60a5fa", paid:"#4ade80", cancelled:"#f87171", overdue:"#f59e0b" };
const STATUS_TR: Record<string,string> = { draft:"Taslak", issued:"Kesildi", paid:"Ödendi", cancelled:"İptal", overdue:"Gecikmiş" };

export default function FaturalarPage() {
  const { success, error: toastError } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("invoices")
      .select("*, orders(order_number,full_name,email)", { count:"exact" })
      .order("created_at", { ascending:false })
      .range((page-1)*PAGE_SIZE, page*PAGE_SIZE-1);
    if (filter) q = q.eq("status", filter);
    const { data, count, error } = await q;
    if (error) { toastError("Faturalar yüklenemedi"); }
    else { setInvoices((data ?? []) as Invoice[]); setTotal(count ?? 0); }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, filter, page]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("invoices").update({ status }).eq("id", id);
    if (error) toastError("Güncelleme başarısız");
    else { success("Fatura durumu güncellendi"); load(); }
  }

  function exportCSV() {
    const rows = ["Fatura No,Sipariş,Müşteri,Tutar,KDV,Durum,Tarih",
      ...invoices.map(i => `${i.invoice_number??"-"},${i.orders?.order_number??"-"},"${i.orders?.full_name??"-"}",₺${i.amount},₺${i.tax_amount??0},${STATUS_TR[i.status]??i.status},${new Date(i.created_at).toLocaleDateString("tr-TR")}`)
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF"+rows], { type:"text/csv;charset=utf-8" }));
    a.download = "faturalar.csv"; a.click();
    success("CSV indirildi");
  }

  const kpi = {
    total: invoices.reduce((s,i) => s+Number(i.amount), 0),
    paid: invoices.filter(i => i.status === "paid").reduce((s,i) => s+Number(i.amount), 0),
    pending: invoices.filter(i => i.status === "issued").length,
    overdue: invoices.filter(i => i.status === "overdue").length,
  };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <FileText size={22} color="#c8a26b" />
          <span style={{ fontSize:22, fontWeight:700, color:"var(--adm-text)" }}>Fatura Yönetimi</span>
          <span style={{ fontSize:13, color:"var(--adm-text-muted)", background:"rgba(0,0,0,0.03)", padding:"3px 10px", borderRadius:20 }}>{total}</span>
        </div>
        <button onClick={exportCSV}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, border:"1px solid rgba(255,255,255,0.08)", background:"transparent", color:"var(--adm-text-muted)", cursor:"pointer", fontSize:13 }}>
          <Download size={14}/> CSV İndir
        </button>
      </div>

      {/* KPI */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {[
          { label:"Toplam Tutar", value:`₺${kpi.total.toFixed(2)}`, color:"#c8a26b", icon:<FileText size={16}/> },
          { label:"Tahsil Edilen", value:`₺${kpi.paid.toFixed(2)}`, color:"#4ade80", icon:<CheckCircle size={16}/> },
          { label:"Bekleyen", value:kpi.pending, color:"#60a5fa", icon:<Clock size={16}/> },
          { label:"Gecikmiş", value:kpi.overdue, color:"#f87171", icon:<XCircle size={16}/> },
        ].map((k,i) => (
          <div key={i} style={{ background:"var(--adm-surface)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:18 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, color:k.color, marginBottom:8 }}>{k.icon}<span style={{ fontSize:12, color:"var(--adm-text-muted)" }}>{k.label}</span></div>
            <div style={{ fontSize:22, fontWeight:700, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filtreler */}
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {[{label:"Tümü",value:""},{label:"Taslak",value:"draft"},{label:"Kesildi",value:"issued"},{label:"Ödendi",value:"paid"},{label:"Gecikmiş",value:"overdue"},{label:"İptal",value:"cancelled"}].map(f => (
          <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }}
            style={{ padding:"6px 14px", borderRadius:20, border: filter===f.value ? "1px solid #c8a26b":"1px solid rgba(255,255,255,0.08)",
              background: filter===f.value ? "rgba(200,162,107,0.12)":"transparent",
              color: filter===f.value ? "#c8a26b":"var(--adm-text-muted)", cursor:"pointer", fontSize:13 }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <SkeletonTable rows={8} cols={6}/> : (
        <div style={{ background:"var(--adm-surface)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"rgba(255,255,255,0.02)" }}>
                {["Fatura No","Sipariş","Müşteri","Tutar","KDV","Durum","Tarih","İşlem"].map(h => (
                  <th key={h} style={{ textAlign:"left", padding:"12px 14px", fontSize:11, color:"var(--adm-text-muted)", fontWeight:500, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan={8} style={{ padding:48, textAlign:"center", color:"var(--adm-text-muted)", fontSize:13 }}>Fatura bulunamadı.</td></tr>
              ) : invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"11px 14px" }}>
                    <code style={{ fontSize:12, color:"#c8a26b" }}>{inv.invoice_number ?? "-"}</code>
                  </td>
                  <td style={{ padding:"11px 14px", fontSize:12, color:"var(--adm-text-muted)" }}>{inv.orders?.order_number ?? "-"}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ fontSize:13, color:"var(--adm-text)" }}>{inv.orders?.full_name ?? "-"}</div>
                    <div style={{ fontSize:11, color:"var(--adm-text-muted)" }}>{inv.orders?.email}</div>
                  </td>
                  <td style={{ padding:"11px 14px", fontSize:13, fontWeight:600, color:"var(--adm-text)" }}>₺{Number(inv.amount).toFixed(2)}</td>
                  <td style={{ padding:"11px 14px", fontSize:13, color:"var(--adm-text-muted)" }}>₺{Number(inv.tax_amount ?? 0).toFixed(2)}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{ fontSize:11, fontWeight:600, color:STATUS_COLORS[inv.status]??"var(--adm-text-muted)",
                      background:`${STATUS_COLORS[inv.status]??"var(--adm-text-muted)"}18`, padding:"3px 10px", borderRadius:20 }}>
                      {STATUS_TR[inv.status] ?? inv.status}
                    </span>
                  </td>
                  <td style={{ padding:"11px 14px", fontSize:12, color:"var(--adm-text-muted)" }}>{new Date(inv.created_at).toLocaleDateString("tr-TR")}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", gap:5 }}>
                      {inv.status !== "paid" && (
                        <button onClick={() => updateStatus(inv.id, "paid")}
                          style={{ fontSize:11, padding:"4px 10px", borderRadius:6, border:"1px solid rgba(74,222,128,0.3)", background:"rgba(74,222,128,0.08)", color:"#4ade80", cursor:"pointer" }}>
                          Ödendi
                        </button>
                      )}
                      {inv.status === "draft" && (
                        <button onClick={() => updateStatus(inv.id, "issued")}
                          style={{ fontSize:11, padding:"4px 10px", borderRadius:6, border:"1px solid rgba(96,165,250,0.3)", background:"rgba(96,165,250,0.08)", color:"#60a5fa", cursor:"pointer" }}>
                          Kes
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:16 }}>
          <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
            style={{ padding:"6px 14px", borderRadius:6, border:"1px solid rgba(255,255,255,0.08)", background:"transparent", color: page===1 ? "#3a3a45":"var(--adm-text-muted)", cursor: page===1 ? "not-allowed":"pointer" }}>
            ← Önceki
          </button>
          <span style={{ padding:"6px 14px", color:"var(--adm-text-muted)", fontSize:13 }}>{page} / {Math.ceil(total/PAGE_SIZE)}</span>
          <button onClick={() => setPage(p => p+1)} disabled={page*PAGE_SIZE >= total}
            style={{ padding:"6px 14px", borderRadius:6, border:"1px solid rgba(255,255,255,0.08)", background:"transparent", color: page*PAGE_SIZE>=total ? "#3a3a45":"var(--adm-text-muted)", cursor: page*PAGE_SIZE>=total ? "not-allowed":"pointer" }}>
            Sonraki →
          </button>
        </div>
      )}
    </div>
  );
}
