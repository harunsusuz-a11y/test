"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import {
  BarChart2, Download, TrendingUp, TrendingDown, ShoppingBag,
  Users, Package, DollarSign, AlertTriangle, RefreshCw,
} from "lucide-react";

const COLORS = ["#56312D","#415D1F","#F9C89E","#FFF6F0","#8B5E3C"];

type Range = "7d" | "30d" | "90d" | "1y";

interface StatCardProps { label: string; value: string; sub?: string; icon: React.FC<Record<string, unknown>>; trend?: number; }
function StatCard({ label, value, sub, icon: Icon, trend }: StatCardProps)  {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-stone-400">{label}</p>
        <Icon size={16 as any} className="text-stone-300" />
      </div>
      <p className="mt-2 text-2xl font-bold text-stone-800">{value}</p>
      <div className="mt-1 flex items-center gap-1">
        {trend !== undefined && (
          trend >= 0
            ? <TrendingUp size={12 as number} className="text-green-600" />
            : <TrendingDown size={12 as number} className="text-red-500" />
        )}
        {sub && <p className="text-xs text-stone-400">{sub}</p>}
      </div>
    </div>
  );
}

export default function RaporlarPage() {
  const supabase = createClient();
  const [range, setRange] = useState<Range>("30d");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalRevenue: 0, totalOrders: 0, avgOrderValue: 0,
    totalCustomers: 0, returnRate: 0, topProduct: "",
    revenueGrowth: 0, orderGrowth: 0,
  });
  const [revenueByDay, setRevenueByDay] = useState<{ date: string; gelir: number; siparis: number }[]>([]);
  const [revenueByProduct, setRevenueByProduct] = useState<{ name: string; value: number }[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<{ name: string; value: number }[]>([]);
  const [lowStock, setLowStock] = useState<{ name: string; quantity: number; critical_level: number }[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
    const from = new Date(Date.now() - days * 86400000).toISOString();

    const [ordersRes, prevOrdersRes, customersRes, returnsRes, inventoryRes] = await Promise.all([
      supabase.from("orders").select("id,total,created_at,status,order_items(product_name,quantity,unit_price)")
        .gte("created_at", from).neq("status", "cancelled"),
      supabase.from("orders").select("id,total")
        .gte("created_at", new Date(Date.now() - days * 2 * 86400000).toISOString())
        .lt("created_at", from).neq("status", "cancelled"),
      supabase.from("profiles").select("id").eq("user_type", "customer"),
      supabase.from("return_requests").select("id").gte("created_at", from),
      supabase.from("inventory").select("quantity,critical_level,product_id,products(name)"),
    ]);

    const orders = ordersRes.data ?? [];
    const prevOrders = prevOrdersRes.data ?? [];
    const customers = customersRes.data ?? [];
    const returns = returnsRes.data ?? [];
    const inventory = inventoryRes.data ?? [];

    const totalRevenue = orders.reduce((s, o) => s + (o.total ?? 0), 0);
    const prevRevenue = prevOrders.reduce((s, o) => s + (o.total ?? 0), 0);
    const totalOrders = orders.length;
    const prevOrderCount = prevOrders.length;
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
    const returnRate = totalOrders ? (returns.length / totalOrders) * 100 : 0;
    const revenueGrowth = prevRevenue ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const orderGrowth = prevOrderCount ? ((totalOrders - prevOrderCount) / prevOrderCount) * 100 : 0;

    // Günlük gelir
    const dayMap: Record<string, { gelir: number; siparis: number }> = {};
    for (let i = 0; i < Math.min(days, 60); i++) {
      const d = new Date(Date.now() - (Math.min(days, 60) - 1 - i) * 86400000);
      const key = d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" });
      dayMap[key] = { gelir: 0, siparis: 0 };
    }
    for (const o of orders) {
      const key = new Date(o.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" });
      if (dayMap[key]) { dayMap[key].gelir += o.total ?? 0; dayMap[key].siparis += 1; }
    }
    setRevenueByDay(Object.entries(dayMap).map(([date, v]) => ({ date, ...v })));

    // Ürün bazlı gelir
    const productRevMap: Record<string, number> = {};
    for (const o of orders) {
      for (const item of (o.order_items ?? []) as { product_name: string; quantity: number; unit_price: number }[]) {
        const k = item.product_name ?? "Bilinmiyor";
        productRevMap[k] = (productRevMap[k] ?? 0) + (item.unit_price ?? 0) * (item.quantity ?? 1);
      }
    }
    const topProductName = Object.entries(productRevMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
    setRevenueByProduct(
      Object.entries(productRevMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name: name.length > 18 ? name.slice(0, 16) + "…" : name, value: Math.round(value) }))
    );

    // Sipariş durumu dağılımı
    const statusMap: Record<string, number> = {};
    for (const o of orders) { statusMap[o.status ?? "other"] = (statusMap[o.status ?? "other"] ?? 0) + 1; }
    const statusLabels: Record<string, string> = {
      pending: "Bekliyor", confirmed: "Onaylandı", shipped: "Kargoda",
      delivered: "Teslim", cancelled: "İptal",
    };
    setOrdersByStatus(Object.entries(statusMap).map(([k, v]) => ({ name: statusLabels[k] ?? k, value: v })));

    // Düşük stok
    const low = (inventory as unknown as { quantity: number; critical_level: number; products: { name: string } | null }[])
      .filter((i: any) => i.quantity <= (i.critical_level ?? 5))
      .map((i: any) => ({ name: i.products?.name ?? "?", quantity: i.quantity, critical_level: i.critical_level ?? 5 }))
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5);
    setLowStock(low);

    setStats({
      totalRevenue, totalOrders, avgOrderValue,
      totalCustomers: customers.length,
      returnRate, topProduct: topProductName,
      revenueGrowth, orderGrowth,
    });
    setLoading(false);
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const fmt = (n: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
  const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

  async function exportCSV() {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
    const from = new Date(Date.now() - days * 86400000).toISOString();
    const { data } = await supabase.from("orders")
      .select("order_number,created_at,full_name,email,total,status")
      .gte("created_at", from).order("created_at", { ascending: false });
    if (!data?.length) return;
    const header = "Sipariş No,Tarih,Müşteri,Email,Tutar,Durum";
    const rows = data.map((o) =>
      [o.order_number, new Date(o.created_at).toLocaleDateString("tr-TR"),
       o.full_name, o.email, o.total, o.status].join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `venti-rapor-${range}.csv`; a.click();
  }

  return (
    <div className="space-y-8 p-6">
      {/* Başlık */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Raporlar</h1>
          <p className="text-sm text-stone-500">Gelir, sipariş ve stok analizi</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-stone-200 bg-white overflow-hidden text-sm">
            {(["7d","30d","90d","1y"] as Range[]).map((r) => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 font-medium transition ${range === r ? "bg-stone-800 text-white" : "text-stone-500 hover:bg-stone-50"}`}>
                {r === "7d" ? "7G" : r === "30d" ? "30G" : r === "90d" ? "90G" : "1Y"}
              </button>
            ))}
          </div>
          <button onClick={load} className="rounded-xl border border-stone-200 bg-white p-2 text-stone-500 hover:bg-stone-50">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={exportCSV} className="flex items-center gap-1.5 rounded-xl bg-stone-800 px-3 py-2 text-sm font-medium text-white hover:bg-stone-700">
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {/* KPI kartları */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Toplam Gelir" value={fmt(stats.totalRevenue)} icon={DollarSign}
          sub={`Geçen dönem: ${pct(stats.revenueGrowth)}`} trend={stats.revenueGrowth} />
        <StatCard label="Sipariş" value={String(stats.totalOrders)} icon={ShoppingBag}
          sub={`Geçen dönem: ${pct(stats.orderGrowth)}`} trend={stats.orderGrowth} />
        <StatCard label="Ort. Sepet" value={fmt(stats.avgOrderValue)} icon={BarChart2}
          sub="Sipariş başına" />
        <StatCard label="Müşteri" value={String(stats.totalCustomers)} icon={Users}
          sub={`İade oranı: %${stats.returnRate.toFixed(1)}`} />
      </div>

      {/* Gelir grafiği */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-stone-700">Günlük Gelir & Sipariş</h2>
          <TrendingUp size={16} className="text-stone-300" />
        </div>
        {loading ? (
          <div className="h-56 animate-pulse rounded-xl bg-stone-100" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueByDay}>
              <defs>
                <linearGradient id="colorGelir" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#56312D" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#56312D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ef" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₺${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: any) => [fmt(Number(v))]} />
              <Area type="monotone" dataKey="gelir" name="Gelir" stroke="#56312D" strokeWidth={2} fill="url(#colorGelir)" />
              <Line type="monotone" dataKey="siparis" name="Sipariş" stroke="#415D1F" strokeWidth={1.5} dot={false} yAxisId={0} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ürün bazlı gelir */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-stone-700">Ürün Bazlı Gelir</h2>
          {loading ? <div className="h-44 animate-pulse rounded-xl bg-stone-100" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={revenueByProduct} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ef" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₺${(v/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v: any) => [fmt(Number(v)), "Gelir"]} />
                <Bar dataKey="value" name="Gelir" radius={[0,4,4,0]}>
                  {revenueByProduct.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sipariş durumu */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-stone-700">Sipariş Durumu</h2>
          {loading ? <div className="h-44 animate-pulse rounded-xl bg-stone-100" /> : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={ordersByStatus} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {ordersByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ul className="flex-1 space-y-2">
                {ordersByStatus.map((s, i) => (
                  <li key={s.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-stone-600">{s.name}</span>
                    </div>
                    <span className="font-medium text-stone-800">{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Düşük stok uyarısı */}
      {lowStock.length > 0 && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" />
            <h2 className="font-semibold text-orange-700">Kritik Stok Uyarısı</h2>
          </div>
          <div className="space-y-2">
            {lowStock.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Package size={14} className="text-stone-400" />
                  <span className="text-sm font-medium text-stone-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-24 rounded-full bg-stone-200">
                    <div className="h-full rounded-full bg-orange-500"
                      style={{ width: `${Math.min(100, (item.quantity / (item.critical_level * 2)) * 100)}%` }} />
                  </div>
                  <span className="text-sm font-bold text-orange-600">{item.quantity} adet</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
