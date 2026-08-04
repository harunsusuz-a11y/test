"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable, type BulkAction } from "@/components/admin/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { Users, UserCheck, UserX, Star } from "lucide-react";

type Customer = {
  id: string; first_name: string | null; last_name: string | null;
  email: string; phone: string | null; status: string;
  user_type: string; total_spent: number | null; total_orders: number | null;
  loyalty_points: number | null; created_at: string;
};

const STATUS_COLORS: Record<string, string> = { active:"#4ade80", inactive:"#f59e0b", banned:"#f87171" };
const STATUS_TR: Record<string, string> = { active:"Aktif", inactive:"Pasif", banned:"Engelli" };

export default function MusterilerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const PAGE_SIZE = 20;
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("profiles")
      .select("id,first_name,last_name,email,phone,status,user_type,total_spent,total_orders,loyalty_points,created_at,group_id,customer_group_id,customer_groups!group_id(name)", { count:"exact" })
      .eq("user_type", "customer")
      .order("created_at", { ascending:false })
      .range((page-1)*PAGE_SIZE, page*PAGE_SIZE-1);
    if (statusFilter) q = q.eq("status", statusFilter);
    if (search) q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    const { data, count } = await q;
    setCustomers((data ?? []) as Customer[]);
    setTotal(count ?? 0);
    setLoading(false);
  }, [supabase, page, statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  async function bulkSetStatus(ids: string[], status: string) {
    await supabase.from("profiles").update({ status }).in("id", ids);
    load();
  }

  function exportCSV() {
    const rows = ["Ad,Soyad,E-posta,Telefon,Durum,Harcama,Sipariş,Kayıt",
      ...customers.map(c => `${c.first_name??""} ,${c.last_name??""},${c.email},${c.phone??"-"},${STATUS_TR[c.status]??c.status},${c.total_spent??0},${c.total_orders??0},${new Date(c.created_at).toLocaleDateString("tr-TR")}`)
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF"+rows], { type:"text/csv;charset=utf-8" }));
    a.download = "musteriler.csv"; a.click();
  }

  const columns: ColumnDef<Customer, unknown>[] = [
    { accessorKey: "first_name", header: "Müşteri",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div>
            <div style={{ fontWeight:500 }}>{c.first_name ?? "-"} {c.last_name ?? ""}</div>
            <div style={{ fontSize:11, color:"#6b6b76" }}>{c.email}</div>
            {c.phone && <div style={{ fontSize:11, color:"#6b6b76" }}>{c.phone}</div>}
          </div>
        );
      }},
    { accessorKey: "status", header: "Durum",
      cell: ({ getValue }) => {
        const s = getValue() as string;
        return <span style={{ fontSize:12, fontWeight:600, color:STATUS_COLORS[s]??"#9b9ba4",
          background:`${STATUS_COLORS[s]??"#9b9ba4"}18`, padding:"3px 10px", borderRadius:20 }}>
          {STATUS_TR[s] ?? s}
        </span>;
      }},
    { accessorKey: "total_orders", header: "Sipariş", enableSorting: true,
      cell: ({ getValue }) => <span style={{ color:"#c8a26b", fontWeight:600 }}>{getValue() as number ?? 0}</span> },
    { accessorKey: "total_spent", header: "Harcama", enableSorting: true,
      cell: ({ getValue }) => <span style={{ fontWeight:600 }}>₺{Number(getValue() ?? 0).toFixed(2)}</span> },
    { accessorKey: "loyalty_points", header: "Puan",
      cell: ({ getValue }) => (
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          <Star size={12} color="#c8a26b" />
          <span style={{ fontSize:13, color:"#c8a26b" }}>{getValue() as number ?? 0}</span>
        </div>
      )},
    { accessorKey: "created_at", header: "Kayıt", enableSorting: true,
      cell: ({ getValue }) => <span style={{ fontSize:12, color:"#6b6b76" }}>{new Date(getValue() as string).toLocaleDateString("tr-TR")}</span> },
  ];

  const bulkActions: BulkAction[] = [
    { label:"Aktifleştir", onClick: (ids) => bulkSetStatus(ids, "active") },
    { label:"Pasifleştir", onClick: (ids) => bulkSetStatus(ids, "inactive") },
    { label:"Engelle", onClick: (ids) => bulkSetStatus(ids, "banned"), danger: true },
  ];

  const kpi = {
    total,
    active: customers.filter(c => c.status === "active").length,
    banned: customers.filter(c => c.status === "banned").length,
    avgSpent: customers.length ? customers.reduce((s,c) => s + Number(c.total_spent??0), 0) / customers.length : 0,
  };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Users size={22} color="#c8a26b" />
          <span style={{ fontSize:22, fontWeight:700, color:"#f2f2f3" }}>Müşteriler</span>
          <span style={{ fontSize:13, color:"#6b6b76", background:"rgba(255,255,255,0.05)", padding:"3px 10px", borderRadius:20 }}>{total}</span>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {[
          { icon:<Users size={16}/>, label:"Toplam", value:total, color:"#c8a26b" },
          { icon:<UserCheck size={16}/>, label:"Aktif", value:kpi.active, color:"#4ade80" },
          { icon:<UserX size={16}/>, label:"Engelli", value:kpi.banned, color:"#f87171" },
          { icon:<Star size={16}/>, label:"Ort. Harcama", value:`₺${kpi.avgSpent.toFixed(2)}`, color:"#a78bfa" },
        ].map((k,i) => (
          <div key={i} style={{ background:"#1a1a1f", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, color:k.color, marginBottom:8 }}>{k.icon}<span style={{ fontSize:12 }}>{k.label}</span></div>
            <div style={{ fontSize:22, fontWeight:700, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Durum filtreleri */}
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {[{ label:"Tümü", value:"" }, { label:"Aktif", value:"active" }, { label:"Pasif", value:"inactive" }, { label:"Engelli", value:"banned" }].map(f => (
          <button key={f.value} onClick={() => { setStatusFilter(f.value); setPage(1); }}
            style={{ padding:"6px 14px", borderRadius:20, border: statusFilter===f.value ? "1px solid #c8a26b":"1px solid rgba(255,255,255,0.08)",
              background: statusFilter===f.value ? "rgba(200,162,107,0.12)":"transparent",
              color: statusFilter===f.value ? "#c8a26b":"#9b9ba4", cursor:"pointer", fontSize:13 }}>
            {f.label}
          </button>
        ))}
      </div>

      <DataTable
        data={customers} columns={columns} loading={loading}
        total={total} page={page} pageSize={PAGE_SIZE}
        onPageChange={p => setPage(p)}
        onSearch={q => { setSearch(q); setPage(1); }}
        searchPlaceholder="Ad, e-posta, telefon…"
        bulkActions={bulkActions}
        onExportCSV={exportCSV}
        emptyMessage="Müşteri bulunamadı."
      />
    </div>
  );
}
