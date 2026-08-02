"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface OrderRow { id:string; status:string; total:number; subtotal:number; shipping_cost:number; discount:number; created_at:string; }
interface TopProduct { product_name:string; qty:number; revenue:number; }

const PERIODS = [
  { key:"7",  label:"7 Gün" },
  { key:"30", label:"30 Gün" },
  { key:"90", label:"90 Gün" },
  { key:"365",label:"1 Yıl" },
];

export default function AdminAnalytics() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7"|"30"|"90"|"365">("30");
  const [compareOrders, setCompareOrders] = useState<OrderRow[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const now = Date.now();
      const since = new Date(now - Number(period)*24*60*60*1000).toISOString();
      const prevSince = new Date(now - 2*Number(period)*24*60*60*1000).toISOString();

      const [{ data:o }, { data:prev }, { data:items }] = await Promise.all([
        supabase.from("orders").select("id,status,total,subtotal,shipping_cost,discount,created_at")
          .gte("created_at", since).order("created_at"),
        supabase.from("orders").select("id,status,total,created_at")
          .gte("created_at", prevSince).lt("created_at", since),
        supabase.from("order_items").select("product_name,quantity,unit_price").limit(1000),
      ]);

      setOrders((o as OrderRow[])||[]);
      setCompareOrders((prev as OrderRow[])||[]);

      // Aggregate top products
      const map: Record<string,TopProduct> = {};
      ((items||[]) as any[]).forEach((item:any) => {
        if (!map[item.product_name]) map[item.product_name] = { product_name:item.product_name, qty:0, revenue:0 };
        map[item.product_name].qty += item.quantity;
        map[item.product_name].revenue += Number(item.unit_price) * item.quantity;
      });
      setTopProducts(Object.values(map).sort((a,b)=>b.revenue-a.revenue).slice(0,8));
      setLoading(false);
    }
    load();
  }, [supabase, period]);

  const valid = orders.filter(o => !["cancelled"].includes(o.status));
  const prevValid = compareOrders.filter(o => !["cancelled"].includes(o.status));
  const totalRevenue = valid.reduce((s,o)=>s+Number(o.total),0);
  const prevRevenue = prevValid.reduce((s,o)=>s+Number(o.total),0);
  const avgOrder = valid.length>0 ? totalRevenue/valid.length : 0;
  const cancelRate = orders.length>0 ? (orders.filter(o=>o.status==="cancelled").length/orders.length*100) : 0;
  const shippingRevenue = valid.reduce((s,o)=>s+Number(o.shipping_cost),0);

  function change(curr:number, prev:number) {
    if (!prev) return null;
    const pct = ((curr-prev)/prev)*100;
    return { pct, up: pct>=0 };
  }
  const revChange = change(totalRevenue, prevRevenue);
  const ordChange = change(valid.length, prevValid.length);

  // Daily buckets
  const bucketCount = Math.min(Number(period), 30);
  const bucketSize = Math.ceil(Number(period)/bucketCount);
  const buckets = new Array(bucketCount).fill(0);
  valid.forEach(o => {
    const daysAgo = Math.floor((Date.now()-new Date(o.created_at).getTime())/(86400000));
    const idx = Math.min(bucketCount-1, Math.floor(daysAgo/bucketSize));
    buckets[bucketCount-1-idx] += Number(o.total);
  });
  const maxBucket = Math.max(...buckets, 1);

  const STATUS_COUNTS = ["pending","confirmed","shipped","delivered","cancelled"].map(s => ({
    label:{pending:"Bekliyor",confirmed:"Hazırlanıyor",shipped:"Kargoda",delivered:"Teslim",cancelled:"İptal"}[s]||s,
    count:orders.filter(o=>o.status===s).length,
    color:{pending:"var(--adm-yellow)",confirmed:"var(--adm-blue)",shipped:"#818cf8",delivered:"var(--adm-green)",cancelled:"var(--adm-red)"}[s]||"var(--adm-text-3)",
  }));

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">Analytics</div><div className="adm-page-sub">Gerçek zamanlı satış verileri</div></div>
        <div className="adm-tabs">
          {PERIODS.map(p => (
            <button key={p.key} className={`adm-tab${period===p.key?" active":""}`} onClick={() => setPeriod(p.key as any)}>{p.label}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="adm-card"><div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div></div> : (
        <>
          {/* KPI */}
          <div className="adm-kpi-grid" style={{ marginBottom:20 }}>
            {[
              { label:"Toplam Gelir",    value:`₺${totalRevenue.toLocaleString("tr-TR",{minimumFractionDigits:0})}`, change:revChange },
              { label:"Sipariş Sayısı",  value:valid.length, change:ordChange },
              { label:"Ort. Sipariş",    value:`₺${avgOrder.toFixed(0)}`, change:null },
              { label:"İptal Oranı",     value:`%${cancelRate.toFixed(1)}`, change:null },
              { label:"Kargo Geliri",    value:`₺${shippingRevenue.toFixed(0)}`, change:null },
            ].map((k,i) => (
              <div key={i} className="adm-stat">
                <div className="adm-stat__label">{k.label}</div>
                <div className="adm-stat__value" style={{ fontSize:20 }}>{k.value}</div>
                {k.change && (
                  <div style={{ fontSize:11, marginTop:4, color:k.change.up?"var(--adm-green)":"var(--adm-red)", fontWeight:500 }}>
                    {k.change.up?"↑":"↓"} %{Math.abs(k.change.pct).toFixed(1)} önceki döneme göre
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:16 }}>
            {/* Gelir Grafiği */}
            <div className="adm-card">
              <div className="adm-card-header">
                <span className="adm-card-title">Gelir Trendi</span>
                <span style={{ fontSize:11, color:"var(--adm-text-3)" }}>Son {period} gün · {bucketCount} dilim</span>
              </div>
              <div style={{ padding:"16px 16px 12px" }}>
                {buckets.every(b=>b===0) ? (
                  <div className="adm-empty" style={{ padding:24 }}>
                    <div className="adm-empty__title">Bu dönemde sipariş yok</div>
                  </div>
                ) : (
                  <>
                    <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:120 }}>
                      {buckets.map((v,i) => (
                        <div key={i} title={`₺${v.toFixed(0)}`}
                          style={{ flex:1, height:`${Math.max(3,(v/maxBucket)*100)}%`, borderRadius:"2px 2px 0 0", cursor:"pointer", transition:"opacity 0.1s",
                            background:i===buckets.length-1?"var(--adm-accent)":`color-mix(in srgb, var(--adm-accent) ${30+Math.round((v/maxBucket)*70)}%, transparent)` }} />
                      ))}
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                      <span style={{ fontSize:9, color:"var(--adm-text-4)" }}>{period} gün önce</span>
                      <span style={{ fontSize:9, color:"var(--adm-text-4)" }}>Bugün · ₺{buckets[buckets.length-1].toFixed(0)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sipariş Dağılımı */}
            <div className="adm-card">
              <div className="adm-card-header"><span className="adm-card-title">Sipariş Durumları</span></div>
              <div style={{ padding:"10px 14px" }}>
                {STATUS_COUNTS.map(s => (
                  <div key={s.label} style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:11, color:"var(--adm-text-2)" }}>{s.label}</span>
                      <span style={{ fontSize:12, fontWeight:600, fontFamily:"var(--adm-mono)", color:s.color }}>{s.count}</span>
                    </div>
                    <div style={{ height:4, background:"var(--adm-surface-4)", borderRadius:2, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${orders.length>0?(s.count/orders.length*100):0}%`, background:s.color, borderRadius:2, transition:"width 0.6s ease" }} />
                    </div>
                  </div>
                ))}
                {orders.length===0 && <div className="adm-empty" style={{ padding:16 }}><div className="adm-empty__title">Sipariş yok</div></div>}
              </div>
            </div>
          </div>

          {/* Top Ürünler */}
          <div className="adm-card">
            <div className="adm-card-header">
              <span className="adm-card-title">En Çok Satan Ürünler</span>
              <span style={{ fontSize:11, color:"var(--adm-text-3)" }}>Tüm zamanlar (order_items bazlı)</span>
            </div>
            {topProducts.length===0 ? (
              <div className="adm-empty"><div className="adm-empty__title">Ürün verisi yok</div></div>
            ) : (
              <table className="adm-table">
                <thead><tr><th>#</th><th>Ürün</th><th>Adet</th><th>Gelir</th><th>Pay</th></tr></thead>
                <tbody>
                  {topProducts.map((p,i) => (
                    <tr key={i}>
                      <td className="adm-mono adm-text-muted" style={{ fontSize:11 }}>#{i+1}</td>
                      <td className="adm-td--strong">{p.product_name}</td>
                      <td className="adm-mono">{p.qty}</td>
                      <td className="adm-mono adm-text-accent">₺{p.revenue.toLocaleString("tr-TR",{minimumFractionDigits:2})}</td>
                      <td style={{ minWidth:140 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div className="adm-progress" style={{ flex:1 }}>
                            <div className="adm-progress-bar" style={{ width:`${topProducts[0].revenue>0?(p.revenue/topProducts[0].revenue*100):0}%` }} />
                          </div>
                          <span style={{ fontSize:10, color:"var(--adm-text-3)", minWidth:35 }}>
                            %{topProducts.reduce((s,x)=>s+x.revenue,0)>0?(p.revenue/topProducts.reduce((s,x)=>s+x.revenue,0)*100).toFixed(1):0}
                          </span>
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
