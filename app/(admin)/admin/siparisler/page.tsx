"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable, type BulkAction } from "@/components/admin/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ShoppingBag, Edit2, ExternalLink } from "lucide-react";
import { useToast } from "@/components/admin/ui/Toast";

type Order = {
  id: string; order_number: string; full_name: string; email: string;
  total: number; status: string; payment_status: string | null;
  created_at: string; city: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  pending:"#f59e0b", confirmed:"#60a5fa", processing:"#a78bfa",
  shipped:"#c8a26b", delivered:"#4ade80", cancelled:"#f87171", refunded:"#9b9ba4",
};
const STATUS_TR: Record<string, string> = {
  pending:"Bekliyor", confirmed:"Onaylandı", processing:"Hazırlanıyor",
  shipped:"Kargoda", delivered:"Teslim", cancelled:"İptal", refunded:"İade",
};

const FILTERS = [
  { label:"Tümü", value:"" },
  { label:"Bekliyor", value:"pending" },
  { label:"Onaylandı", value:"confirmed" },
  { label:"Kargoda", value:"shipped" },
  { label:"Teslim", value:"delivered" },
  { label:"İptal", value:"cancelled" },
];

export default function SiparislerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const { success } = useToast();
  const PAGE_SIZE = 20;
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("orders")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page-1)*PAGE_SIZE, page*PAGE_SIZE-1);
    if (statusFilter) q = q.eq("status", statusFilter);
    if (search) q = q.or(`order_number.ilike.%${search}%,full_name.ilike.%${search}%,email.ilike.%${search}%`);
    const { data, count } = await q;
    setOrders((data ?? []) as Order[]);
    setTotal(count ?? 0);
    setLoading(false);
  }, [supabase, page, statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    setUpdating(true);
    await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    await supabase.from("order_status_history").insert({ order_id: id, new_status: status, created_at: new Date().toISOString() });
    setUpdating(false);
    setSelectedOrder(null);
    load();
  }

  async function bulkUpdateStatus(ids: string[], status: string) {
    await supabase.from("orders").update({ status }).in("id", ids);
    load();
  }

  function exportCSV() {
    const rows = ["Sipariş No,Müşteri,E-posta,Şehir,Tutar,Durum,Tarih",
      ...orders.map(o => `${o.order_number},${o.full_name},${o.email},${o.city??"-"},${o.total},${STATUS_TR[o.status]??o.status},${new Date(o.created_at).toLocaleDateString("tr-TR")}`)
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF"+rows, { type:"text/csv;charset=utf-8" }] as BlobPart[]));
    a.download = "siparisler.csv"; a.click();
  }

  const columns: ColumnDef<Order, unknown>[] = [
    { accessorKey: "order_number", header: "Sipariş No",
      cell: ({ getValue }) => <span style={{ color:"#c8a26b", fontWeight:600, fontFamily:"monospace" }}>{getValue() as string}</span> },
    { accessorKey: "full_name", header: "Müşteri",
      cell: ({ row }) => (
        <div>
          <div style={{ fontWeight:500 }}>{row.original.full_name}</div>
          <div style={{ fontSize:11, color:"#6b6b76" }}>{row.original.email}</div>
        </div>
      )},
    { accessorKey: "city", header: "Şehir",
      cell: ({ getValue }) => <span style={{ color:"#9b9ba4" }}>{(getValue() as string) ?? "-"}</span> },
    { accessorKey: "total", header: "Tutar", enableSorting: true,
      cell: ({ getValue }) => <span style={{ fontWeight:600 }}>₺{Number(getValue()).toFixed(2)}</span> },
    { accessorKey: "status", header: "Durum",
      cell: ({ getValue }) => {
        const s = getValue() as string;
        return <span style={{ fontSize:12, fontWeight:600, color: STATUS_COLORS[s]??"#9b9ba4",
          background:`${STATUS_COLORS[s]??"#9b9ba4"}18`, padding:"3px 10px", borderRadius:20 }}>
          {STATUS_TR[s] ?? s}
        </span>;
      }},
    { accessorKey: "created_at", header: "Tarih", enableSorting: true,
      cell: ({ getValue }) => <span style={{ fontSize:12, color:"#6b6b76" }}>{new Date(getValue() as string).toLocaleDateString("tr-TR")}</span> },
    { id: "actions", header: "",
      cell: ({ row }) => (
        <div style={{ display:"flex", gap:6 }}>
          <div style={{ display:"flex", gap:5 }}>
            <Link href={`/admin/siparisler/${row.original.id}`}
              style={{ display:"flex", alignItems:"center", background:"rgba(96,165,250,0.1)", border:"none", borderRadius:6, padding:"5px 10px", color:"#60a5fa", textDecoration:"none" }}>
              <ExternalLink size={13} />
            </Link>
            <button onClick={() => setSelectedOrder(row.original)}
              style={{ background:"rgba(200,162,107,0.1)", border:"none", borderRadius:6, padding:"5px 10px", color:"#c8a26b", cursor:"pointer" }}>
              <Edit2 size={13} />
            </button>
          </div>
        </div>
      )},
  ];

  const bulkActions: BulkAction[] = [
    { label:"Onayla", onClick: (ids) => bulkUpdateStatus(ids, "confirmed") },
    { label:"Kargoya Ver", onClick: (ids) => bulkUpdateStatus(ids, "shipped") },
    { label:"İptal Et", onClick: (ids) => bulkUpdateStatus(ids, "cancelled"), danger: true },
  ];

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <ShoppingBag size={22} color="#c8a26b" />
          <span style={{ fontSize:22, fontWeight:700, color:"#f2f2f3" }}>Siparişler</span>
          <span style={{ fontSize:13, color:"#6b6b76", background:"rgba(255,255,255,0.05)", padding:"3px 10px", borderRadius:20 }}>{total}</span>
        </div>
      </div>

      {/* Durum filtreleri */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" as "wrap" }}>
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => { setStatusFilter(f.value); setPage(1); }}
            style={{ padding:"6px 14px", borderRadius:20, border: statusFilter===f.value ? "1px solid #c8a26b":"1px solid rgba(255,255,255,0.08)",
              background: statusFilter===f.value ? "rgba(200,162,107,0.12)":"transparent",
              color: statusFilter===f.value ? "#c8a26b":"#9b9ba4", cursor:"pointer", fontSize:13 }}>
            {f.label}
          </button>
        ))}
      </div>

      <DataTable
        data={orders} columns={columns} loading={loading}
        total={total} page={page} pageSize={PAGE_SIZE}
        onPageChange={p => setPage(p)}
        onSearch={q => { setSearch(q); setPage(1); }}
        searchPlaceholder="Sipariş no, müşteri, e-posta…"
        bulkActions={bulkActions}
        onExportCSV={exportCSV}
        emptyMessage="Sipariş bulunamadı."
      />

      {/* Sipariş detay / durum güncelleme modal */}
      {selectedOrder && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}
          onClick={() => setSelectedOrder(null)}>
          <div style={{ background:"#1a1a1f", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:28, width:440, maxWidth:"90vw" }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize:17, fontWeight:700, color:"#f2f2f3", marginBottom:6 }}>{selectedOrder.order_number}</h3>
            <p style={{ fontSize:13, color:"#6b6b76", marginBottom:20 }}>{selectedOrder.full_name} · {selectedOrder.email}</p>
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:12, color:"#6b6b76", marginBottom:8 }}>Durum Güncelle</p>
              <div style={{ display:"flex", flexWrap:"wrap" as "wrap", gap:8 }}>
                {Object.entries(STATUS_TR).map(([val, label]) => (
                  <button key={val} onClick={() => updateStatus(selectedOrder.id, val)} disabled={updating || selectedOrder.status === val}
                    style={{ padding:"6px 14px", borderRadius:8, border: selectedOrder.status===val ? `1px solid ${STATUS_COLORS[val]}` : "1px solid rgba(255,255,255,0.08)",
                      background: selectedOrder.status===val ? `${STATUS_COLORS[val]}22` : "transparent",
                      color: selectedOrder.status===val ? STATUS_COLORS[val] : "#9b9ba4",
                      cursor: selectedOrder.status===val || updating ? "not-allowed":"pointer", fontSize:12, fontWeight: selectedOrder.status===val ? 700 : 400,
                      opacity: updating ? .6 : 1 }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:18, fontWeight:700, color:"#f2f2f3" }}>₺{Number(selectedOrder.total).toFixed(2)}</span>
              <button onClick={() => setSelectedOrder(null)}
                style={{ padding:"7px 18px", borderRadius:7, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#9b9ba4", cursor:"pointer" }}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
