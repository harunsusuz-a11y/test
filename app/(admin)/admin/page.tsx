"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/ui/Toast";
import { SkeletonKpiGrid, SkeletonCard } from "@/components/admin/ui/Skeleton";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ShoppingBag, Users, Package, TrendingUp, Clock, XCircle, Star, AlertTriangle } from "lucide-react";

type Stats = {
  totalRevenue: number; totalOrders: number; pendingOrders: number;
  cancelledOrders: number; newCustomers: number; totalProducts: number;
  activeProducts: number; avgOrder: number; avgRating: number;
};

type RecentOrder = { id: string; order_number: string; full_name: string; total: number; status: string; created_at: string };
type LowStock = { id: string; name: string; slug: string };
type SalesPoint = { date: string; total: number; orders: number };

const STATUS_TR: Record<string,string> = { pending:"Bekliyor", confirmed:"Onaylı", shipped:"Kargoda", delivered:"Teslim", cancelled:"İptal" };
const STATUS_C: Record<string,string> = { pending:"#f59e0b", confirmed:"#60a5fa", shipped:"#c8a26b", delivered:"#4ade80", cancelled:"#f87171" };

export default function Dashboard() {
  const { success, error: toastError } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStock, setLowStock] = useState<LowStock[]>([]);
  const [salesChart, setSalesChart] = useState<SalesPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const from = new Date(Date.now() - parseInt(range)*86400000).toISOString();

        const [ordersRes, profilesRes, productsRes, reviewsRes, recentRes, lowRes] = await Promise.all([
          supabase.from("orders").select("status,total,created_at").gte("created_at", from),
          supabase.from("profiles").select("created_at").eq("user_type","customer").gte("created_at", from),
          supabase.from("products").select("status").is("deleted_at", null),
          supabase.from("reviews").select("rating").eq("status","approved"),
          supabase.from("orders").select("id,order_number,full_name,total,status,created_at").order("created_at",{ascending:false}).limit(8),
          supabase.from("inventory").select("id,product_id,quantity,products(name,slug)").lt("quantity", 10).limit(5),
        ]);

        const orders = ordersRes.data ?? [];
        const delivered = orders.filter(o => o.status === "delivered");
        const totalRevenue = delivered.reduce((s,o) => s+Number(o.total), 0);
        const avgOrder = orders.length ? totalRevenue / orders.length : 0;
        const reviews = reviewsRes.data ?? [];
        const avgRating = reviews.length ? reviews.reduce((s,r) => s+r.rating, 0) / reviews.length : 0;
        const prods = productsRes.data ?? [];

        setStats({
          totalRevenue, totalOrders: orders.length,
          pendingOrders: orders.filter(o => o.status === "pending").length,
          cancelledOrders: orders.filter(o => o.status === "cancelled").length,
          newCustomers: profilesRes.data?.length ?? 0,
          totalProducts: prods.length,
          activeProducts: prods.filter(p => p.status === "active").length,
          avgOrder, avgRating,
        });

        setRecentOrders((recentRes.data ?? []) as RecentOrder[]);
        setLowStock((lowRes.data ?? []).map((i: { id:string; product_id:string; quantity:number; products?: unknown }) => {
          const p = Array.isArray(i.products) ? i.products[0] : i.products;
          return { id: i.product_id, name: (p as { name?:string })?.name ?? "Ürün", slug: (p as { slug?:string })?.slug ?? "" };
        }));

        // Günlük satış chart
        const byDay: Record<string,SalesPoint> = {};
        orders.forEach(o => {
          const d = o.created_at.slice(0,10);
          if (!byDay[d]) byDay[d] = { date:d, total:0, orders:0 };
          byDay[d].total += Number(o.total);
          byDay[d].orders++;
        });
        setSalesChart(Object.values(byDay).sort((a,b) => a.date.localeCompare(b.date)));

        success("Dashboard güncellendi", `Son ${range} günün verisi yüklendi.`);
      } catch {
        toastError("Veri yüklenemedi", "Bağlantıyı kontrol edin.");
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const cardStyle: React.CSSProperties = { background:"#1a1a1f", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:20 };

  return (
    <div style={{ padding:24 }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:"#f2f2f3", margin:0 }}>Dashboard</h1>
          <p style={{ fontSize:13, color:"#6b6b76", margin:"4px 0 0" }}>Mağaza genel bakışı</p>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["7","30","90","365"].map(r => (
            <button key={r} onClick={() => setRange(r)}
              style={{ padding:"6px 14px", borderRadius:8, border: range===r ? "1px solid #c8a26b":"1px solid rgba(255,255,255,0.08)",
                background: range===r ? "rgba(200,162,107,0.12)":"transparent",
                color: range===r ? "#c8a26b":"#9b9ba4", cursor:"pointer", fontSize:13 }}>
              {r}g
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      {loading ? <SkeletonKpiGrid count={4} /> : stats && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
          {[
            { icon:<TrendingUp size={18}/>, label:"Toplam Gelir", value:`₺${stats.totalRevenue.toFixed(2)}`, sub:`Ort. ₺${stats.avgOrder.toFixed(2)}`, color:"#c8a26b" },
            { icon:<ShoppingBag size={18}/>, label:"Toplam Sipariş", value:stats.totalOrders, sub:`${stats.pendingOrders} bekliyor`, color:"#60a5fa" },
            { icon:<Users size={18}/>, label:"Yeni Müşteri", value:stats.newCustomers, sub:`Son ${range} gün`, color:"#4ade80" },
            { icon:<Package size={18}/>, label:"Aktif Ürün", value:stats.activeProducts, sub:`${stats.totalProducts} toplam`, color:"#a78bfa" },
          ].map((k,i) => (
            <div key={i} style={cardStyle}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <p style={{ fontSize:12, color:"#6b6b76", margin:"0 0 8px" }}>{k.label}</p>
                  <p style={{ fontSize:26, fontWeight:700, color:k.color, margin:0 }}>{k.value}</p>
                  <p style={{ fontSize:12, color:"#6b6b76", margin:"4px 0 0" }}>{k.sub}</p>
                </div>
                <div style={{ color:k.color, opacity:.6 }}>{k.icon}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* İkinci KPI satırı */}
      {!loading && stats && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
          {[
            { icon:<Clock size={16}/>, label:"Bekleyen Sipariş", value:stats.pendingOrders, color:"#f59e0b" },
            { icon:<XCircle size={16}/>, label:"İptal Edilen", value:stats.cancelledOrders, color:"#f87171" },
            { icon:<Star size={16}/>, label:"Ort. Puanlama", value:stats.avgRating.toFixed(1)+" ★", color:"#c8a26b" },
            { icon:<AlertTriangle size={16}/>, label:"Düşük Stok", value:lowStock.length+" ürün", color:"#f87171" },
          ].map((k,i) => (
            <div key={i} style={{ ...cardStyle, padding:"14px 18px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <span style={{ color:k.color }}>{k.icon}</span>
                <span style={{ fontSize:12, color:"#6b6b76" }}>{k.label}</span>
              </div>
              <span style={{ fontSize:20, fontWeight:700, color:k.color }}>{k.value}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:20 }}>
        {/* Satış Grafiği */}
        <div style={cardStyle}>
          <p style={{ fontSize:14, fontWeight:600, color:"#f2f2f3", marginBottom:16 }}>Satış Trendi</p>
          {loading ? <SkeletonCard lines={5} /> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={salesChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill:"#6b6b76", fontSize:11 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fill:"#6b6b76", fontSize:11 }} />
                <Tooltip contentStyle={{ background:"#1a1a1f", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, fontSize:12 }} />
                <Line type="monotone" dataKey="total" stroke="#c8a26b" strokeWidth={2} dot={false} name="Gelir (₺)" />
                <Line type="monotone" dataKey="orders" stroke="#60a5fa" strokeWidth={2} dot={false} name="Sipariş" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Düşük Stok */}
        <div style={cardStyle}>
          <p style={{ fontSize:14, fontWeight:600, color:"#f2f2f3", marginBottom:14 }}>
            <AlertTriangle size={14} style={{ display:"inline", marginRight:6, color:"#f87171" }} />
            Kritik Stok
          </p>
          {loading ? <SkeletonCard lines={5} /> : lowStock.length === 0 ? (
            <p style={{ fontSize:13, color:"#6b6b76" }}>Stok sorunu yok 🎉</p>
          ) : lowStock.map(p => (
            <div key={p.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:13 }}>
              <span style={{ color:"#f2f2f3" }}>{p.name}</span>
              <span style={{ color:"#f87171", fontWeight:600 }}>Düşük</span>
            </div>
          ))}
        </div>
      </div>

      {/* Son Siparişler */}
      <div style={cardStyle}>
        <p style={{ fontSize:14, fontWeight:600, color:"#f2f2f3", marginBottom:14 }}>Son Siparişler</p>
        {loading ? <SkeletonCard lines={8} /> : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                {["Sipariş No","Müşteri","Tutar","Durum","Tarih"].map(h => (
                  <th key={h} style={{ textAlign:"left", padding:"8px 12px", fontSize:11, color:"#6b6b76", borderBottom:"1px solid rgba(255,255,255,0.06)", fontWeight:500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} style={{ padding:24, textAlign:"center", color:"#6b6b76", fontSize:13 }}>Sipariş bulunamadı.</td></tr>
              ) : recentOrders.map(o => (
                <tr key={o.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"10px 12px", fontFamily:"monospace", fontSize:12, color:"#c8a26b" }}>{o.order_number}</td>
                  <td style={{ padding:"10px 12px", fontSize:13, color:"#f2f2f3" }}>{o.full_name}</td>
                  <td style={{ padding:"10px 12px", fontSize:13, fontWeight:600, color:"#f2f2f3" }}>₺{Number(o.total).toFixed(2)}</td>
                  <td style={{ padding:"10px 12px" }}>
                    <span style={{ fontSize:11, fontWeight:600, color:STATUS_C[o.status]??"#9b9ba4", background:`${STATUS_C[o.status]??"#9b9ba4"}18`, padding:"2px 8px", borderRadius:20 }}>
                      {STATUS_TR[o.status] ?? o.status}
                    </span>
                  </td>
                  <td style={{ padding:"10px 12px", fontSize:12, color:"#6b6b76" }}>{new Date(o.created_at).toLocaleDateString("tr-TR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
