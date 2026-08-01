"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface OrderRow { status:string; total:number; created_at:string; }
interface TopProduct { product_name:string; qty:number; revenue:number; }

export default function AdminAnalytics() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7"|"30"|"90"|"365">("30");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const since = new Date(Date.now() - Number(period)*24*60*60*1000).toISOString();

      const [{ data:o }, { data:items }] = await Promise.all([
        supabase.from("orders").select("status,total,created_at").gte("created_at",since).order("created_at"),
        supabase.from("order_items").select("product_name,quantity,total").gte("created_at",since),
      ]);

      setOrders((o as OrderRow[])||[]);

      // Aggregate top products
      const map: Record<string,TopProduct> = {};
      ((items||[]) as any[]).forEach(item => {
        if (!map[item.product_name]) map[item.product_name] = { product_name:item.product_name, qty:0, revenue:0 };
        map[item.product_name].qty += item.quantity;
        map[item.product_name].revenue += Number(item.total);
      });
      setTopProducts(Object.values(map).sort((a,b)=>b.revenue-a.revenue).slice(0,8));
      setLoading(false);
    }
    load();
  }, [supabase, period]);

  const validOrders = orders.filter(o => !["cancelled","refunded","failed"].includes(o.status));
  const totalRevenue = validOrders.reduce((s,o)=>s+Number(o.total),0);
  const avgOrder = validOrders.length>0?totalRevenue/validOrders.length:0;
  const cancelRate = orders.length>0?(orders.filter(o=>o.status==="cancelled").length/orders.length*100):0;

  // Daily revenue for chart
  const days = Number(period);
  const buckets: number[] = new Array(Math.min(days,30)).fill(0);
  const bucketSize = Math.max(1, Math.floor(days/30));
  validOrders.forEach(o => {
    const daysAgo = Math.floor((Date.now()-new Date(o.created_at).getTime())/(1000*60*60*24));
    const idx = Math.min(buckets.length-1, Math.floor(daysAgo/bucketSize));
    buckets[buckets.length-1-idx] += Number(o.total);
  });
  const maxBucket = Math.max(...buckets,1);

  const STATUS_COUNTS = ["pending","preparing","shipped","delivered","cancelled"].map(s => ({
    label: { pending:"Bekliyor", preparing:"Hazırlanıyor", shipped:"Kargoda", delivered:"Teslim", cancelled:"İptal" }[s]||s,
    count: orders.filter(o=>o.status===s).length,
    color: { pending:"var(--adm-yellow)", preparing:"var(--adm-blue)", shipped:"var(--adm-blue)", delivered:"var(--adm-green)", cancelled:"var(--adm-red)" }[s]||"var(--adm-text-3)",
  }));

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">Analytics</div><div className="adm-page-sub">Satış ve performans metrikleri</div></div>
        <div className="adm-tabs">
          {(["7","30","90","365"] as const).map(p => (
            <button key={p} className={`adm-tab${period===p?" active":""}`} onClick={()=>setPeriod(p)}>
              {p==="7"?"7G":p==="30"?"30G":p==="90"?"3A":"1Y"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="adm-card"><div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div></div>
      ) : (
        <>
          {/* KPI */}
          <div className="adm-kpi-grid" style={{ marginBottom:20 }}>
            {[
              { label:"Toplam Gelir", value:`₺${totalRevenue.toLocaleString("tr-TR",{minimumFractionDigits:0})}` },
              { label:"Toplam Sipariş", value:orders.length },
              { label:"Ort. Sipariş", value:`₺${avgOrder.toFixed(0)}` },
              { label:"İptal Oranı", value:`%${cancelRate.toFixed(1)}` },
            ].map((k,i) => (
              <div key={i} className="adm-stat">
                <div className="adm-stat__label">{k.label}</div>
                <div className="adm-stat__value" style={{ fontSize:22 }}>{k.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:16 }}>
            {/* Gelir Grafiği */}
            <div className="adm-card">
              <div className="adm-card-header">
                <span className="adm-card-title">Gelir Trendi</span>
                <span style={{ fontSize:12, color:"var(--adm-text-3)" }}>{period} günlük</span>
              </div>
              <div style={{ padding:"16px 16px 12px" }}>
                {buckets.every(b=>b===0) ? (
                  <div className="adm-empty" style={{ padding:24 }}><div className="adm-empty__title">Bu dönemde sipariş yok</div></div>
                ) : (
                  <>
                    <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:100 }}>
                      {buckets.map((v,i) => (
                        <div key={i} style={{ flex:1, height:`${Math.max(4,(v/maxBucket)*100)}%`, background:i===buckets.length-1?"var(--adm-accent)":"var(--adm-surface-4)", borderRadius:"2px 2px 0 0", minHeight:3, transition:"background 0.15s", cursor:"pointer" }} title={`₺${v.toFixed(0)}`} />
                      ))}
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                      <span style={{ fontSize:9, color:"var(--adm-text-4)" }}>{period} gün önce</span>
                      <span style={{ fontSize:9, color:"var(--adm-text-4)" }}>Bugün</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sipariş Dağılımı */}
            <div className="adm-card">
              <div className="adm-card-header"><span className="adm-card-title">Sipariş Durumları</span></div>
              <div style={{ padding:"12px 14px" }}>
                {STATUS_COUNTS.map(s => (
                  <div key={s.label} style={{ marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:12, color:"var(--adm-text-2)" }}>{s.label}</span>
                      <span style={{ fontSize:12, fontWeight:600, fontFamily:"var(--adm-mono)", color:"var(--adm-text)" }}>{s.count}</span>
                    </div>
                    <div style={{ height:4, background:"var(--adm-surface-4)", borderRadius:2, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${orders.length>0?(s.count/orders.length*100):0}%`, background:s.color, borderRadius:2, transition:"width 0.5s" }} />
                    </div>
                  </div>
                ))}
                {orders.length===0 && <div className="adm-empty" style={{ padding:16 }}><div className="adm-empty__title">Sipariş yok</div></div>}
              </div>
            </div>
          </div>

          {/* Top Ürünler */}
          <div className="adm-card">
            <div className="adm-card-header"><span className="adm-card-title">En Çok Satan Ürünler</span></div>
            {topProducts.length===0 ? (
              <div className="adm-empty"><div className="adm-empty__title">Bu dönemde veri yok</div></div>
            ) : (
              <table className="adm-table">
                <thead><tr><th>Ürün</th><th>Adet</th><th>Gelir</th><th>Pay</th></tr></thead>
                <tbody>
                  {topProducts.map((p,i) => (
                    <tr key={i}>
                      <td className="adm-td--strong">{p.product_name}</td>
                      <td className="adm-mono">{p.qty}</td>
                      <td className="adm-mono adm-text-accent">₺{p.revenue.toLocaleString("tr-TR",{minimumFractionDigits:2})}</td>
                      <td style={{ minWidth:120 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div className="adm-progress" style={{ flex:1 }}>
                            <div className="adm-progress-bar" style={{ width:`${totalRevenue>0?(p.revenue/totalRevenue*100):0}%` }} />
                          </div>
                          <span style={{ fontSize:10, color:"var(--adm-text-3)", minWidth:30 }}>%{totalRevenue>0?(p.revenue/totalRevenue*100).toFixed(1):0}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
