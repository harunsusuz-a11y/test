"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BarChart2, Download, TrendingUp } from "lucide-react";

const COLORS = ["#c8a26b","#4ade80","#60a5fa","#f87171","#a78bfa"];

export default function RaporlarPage() {
  const [range, setRange] = useState("30");
  const [salesData, setSalesData] = useState<{date:string;total:number;orders:number}[]>([]);
  const [productData, setProductData] = useState<{name:string;value:number}[]>([]);
  const [statusData, setStatusData] = useState<{name:string;value:number}[]>([]);
  const [kpi, setKpi] = useState({ revenue:0, orders:0, avgOrder:0, customers:0 });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const from = new Date(Date.now() - parseInt(range) * 86400000).toISOString();
      
      const [ordersRes, itemsRes] = await Promise.all([
        supabase.from("orders").select("status,total,created_at").gte("created_at", from),
        supabase.from("order_items").select("product_id,quantity,unit_price,products(name)").gte("created_at", from),
      ]);

      const orders = ordersRes.data ?? [];
      const items = itemsRes.data ?? [];

      // Günlük satış
      const byDay = orders.reduce((acc: Record<string, {total:number;orders:number}>, o) => {
        const d = o.created_at.slice(0,10);
        if (!acc[d]) acc[d] = { total:0, orders:0 };
        acc[d].total += Number(o.total);
        acc[d].orders++;
        return acc;
      }, {});
      setSalesData(Object.entries(byDay).map(([date,v]) => ({ date, ...v })).sort((a,b) => a.date.localeCompare(b.date)));

      // Durum dağılımı
      const statusMap = orders.reduce((acc: Record<string,number>, o) => { acc[o.status] = (acc[o.status]||0)+1; return acc; }, {});
      const STATUS_TR: Record<string,string> = { pending:"Bekleyen", confirmed:"Onaylı", shipped:"Kargoda", delivered:"Teslim", cancelled:"İptal" };
      setStatusData(Object.entries(statusMap).map(([k,v]) => ({ name: STATUS_TR[k]??k, value: v })));

      // Top ürünler
      const prodMap = items.reduce((acc: Record<string,{name:string;value:number}>, i) => {
        const n = (i.products as {name?:string} | null)?.name ?? "Bilinmiyor";
        if (!acc[n]) acc[n] = { name:n, value:0 };
        acc[n].value += (i.quantity ?? 1);
        return acc;
      }, {});
      setProductData(Object.values(prodMap).sort((a,b) => b.value-a.value).slice(0,5));

      const delivered = orders.filter(o => o.status === "delivered");
      const revenue = delivered.reduce((s,o) => s+Number(o.total), 0);
      setKpi({ revenue, orders: orders.length, avgOrder: orders.length ? revenue/orders.length : 0, customers: 0 });
      setLoading(false);
    }
    load();
  }, [range, supabase]);

  function exportCSV() {
    const csv = ["Tarih,Gelir,Sipariş", ...salesData.map(d => `${d.date},${d.total},${d.orders}`)].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
    a.download = `rapor_${range}gun.csv`; a.click();
  }

  const cardStyle: React.CSSProperties = { background:"#1a1a1f", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:20 };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <BarChart2 size={22} color="#c8a26b" />
          <span style={{ fontSize:22, fontWeight:700, color:"#f2f2f3" }}>Raporlar & Analiz</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {["7","30","90"].map(r => (
            <button key={r} onClick={() => setRange(r)}
              style={{ padding:"6px 14px", borderRadius:6, border: range===r ? "1px solid #c8a26b" : "1px solid rgba(255,255,255,0.1)",
                background: range===r ? "rgba(200,162,107,0.1)" : "transparent",
                color: range===r ? "#c8a26b" : "#9b9ba4", cursor:"pointer", fontSize:13 }}>
              {r} gün
            </button>
          ))}
          <button onClick={exportCSV}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:6, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#9b9ba4", cursor:"pointer", fontSize:13 }}>
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {/* KPI Kartları */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Toplam Gelir", value:`₺${kpi.revenue.toFixed(2)}`, icon:"💰" },
          { label:"Toplam Sipariş", value:kpi.orders, icon:"📦" },
          { label:"Ort. Sepet", value:`₺${kpi.avgOrder.toFixed(2)}`, icon:"🛒" },
          { label:"Dönem", value:`${range} gün`, icon:"📅" },
        ].map((k, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ fontSize:24, marginBottom:8 }}>{k.icon}</div>
            <div style={{ fontSize:20, fontWeight:700, color:"#f2f2f3" }}>{k.value}</div>
            <div style={{ fontSize:13, color:"#6b6b76", marginTop:4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {loading ? <p style={{ color:"#6b6b76" }}>Yükleniyor…</p> : (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          {/* Satış Grafiği */}
          <div style={{ ...cardStyle, gridColumn:"1 / -1" }}>
            <p style={{ fontSize:15, fontWeight:600, color:"#f2f2f3", marginBottom:16 }}>Günlük Satış Trendi</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill:"#6b6b76", fontSize:11 }} />
                <YAxis tick={{ fill:"#6b6b76", fontSize:11 }} />
                <Tooltip contentStyle={{ background:"#1a1a1f", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8 }} />
                <Line type="monotone" dataKey="total" stroke="#c8a26b" strokeWidth={2} dot={false} name="Gelir (₺)" />
                <Line type="monotone" dataKey="orders" stroke="#4ade80" strokeWidth={2} dot={false} name="Sipariş" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sipariş Durumu */}
          <div style={cardStyle}>
            <p style={{ fontSize:15, fontWeight:600, color:"#f2f2f3", marginBottom:16 }}>Sipariş Durum Dağılımı</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Ürünler */}
          <div style={cardStyle}>
            <p style={{ fontSize:15, fontWeight:600, color:"#f2f2f3", marginBottom:16 }}>En Çok Satan Ürünler</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={productData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill:"#6b6b76", fontSize:11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill:"#6b6b76", fontSize:11 }} width={100} />
                <Tooltip contentStyle={{ background:"#1a1a1f", border:"1px solid rgba(255,255,255,0.1)" }} />
                <Bar dataKey="value" fill="#c8a26b" radius={[0,4,4,0]} name="Satış" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
