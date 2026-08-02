"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface RecentOrder { id:string; order_number:string; status:string; total:number; full_name:string; email:string; city:string|null; created_at:string; }

const STATUS_COLORS: Record<string,string> = { pending:"var(--adm-yellow)", confirmed:"var(--adm-blue)", shipped:"#818cf8", delivered:"var(--adm-green)", cancelled:"var(--adm-red)" };
const STATUS_TR: Record<string,string> = { pending:"Bekliyor", confirmed:"Hazırlanıyor", shipped:"Kargoda", delivered:"Teslim", cancelled:"İptal" };

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue:0, orders:0, pending:0, products:0, customers:0, coupons:0, avgOrder:0 });
  const [recent, setRecent] = useState<RecentOrder[]>([]);
  const [sparkline, setSparkline] = useState<number[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const since30 = new Date(Date.now()-30*86400000).toISOString();
      const since7  = new Date(Date.now()-7*86400000).toISOString();

      const [{ data:o30 },{ data:o7 },{ data:prod },{ data:prof },{ data:coup },{ data:rec }] = await Promise.all([
        supabase.from("orders").select("status,total,created_at").gte("created_at",since30),
        supabase.from("orders").select("total,created_at").gte("created_at",since7).not("status","eq","cancelled"),
        supabase.from("products").select("id").is("deleted_at",null).eq("status","active"),
        supabase.from("profiles").select("id").eq("user_type","customer"),
        supabase.from("coupons").select("id").eq("is_active",true),
        supabase.from("orders").select("id,order_number,status,total,full_name,email,city,created_at").order("created_at",{ascending:false}).limit(8),
      ]);

      const orders30 = (o30||[]) as any[];
      const valid30 = orders30.filter((x:any)=>x.status!=="cancelled");
      const revenue30 = valid30.reduce((s:number,x:any)=>s+Number(x.total),0);

      // 7-day sparkline (daily)
      const days7 = new Array(7).fill(0);
      ((o7||[]) as any[]).forEach((x:any) => {
        const dAgo = Math.floor((Date.now()-new Date(x.created_at).getTime())/86400000);
        if (dAgo<7) days7[6-dAgo]+=Number(x.total);
      });

      setStats({
        revenue: revenue30,
        orders: orders30.length,
        pending: orders30.filter((x:any)=>["pending","confirmed"].includes(x.status)).length,
        products: prod?.length||0,
        customers: prof?.length||0,
        coupons: coup?.length||0,
        avgOrder: valid30.length>0?revenue30/valid30.length:0,
      });
      setSparkline(days7);
      setRecent((rec as RecentOrder[])||[]);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const maxSpark = Math.max(...sparkline, 1);

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Dashboard</div>
          <div className="adm-page-sub">{new Date().toLocaleDateString("tr-TR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Link href="/admin/siparisler" className="adm-btn adm-btn--secondary">Siparişler</Link>
          <Link href="/admin/urunler" className="adm-btn adm-btn--primary">+ Ürün Ekle</Link>
        </div>
      </div>

      {/* KPI */}
      <div className="adm-kpi-grid" style={{ marginBottom:20 }}>
        {/* Gelir */}
        <div className="adm-stat" style={{ borderColor:"rgba(200,162,107,0.25)" }}>
          <div className="adm-stat__label">Son 30 Gün Gelir</div>
          <div className="adm-stat__value">{loading?"…":`₺${stats.revenue.toLocaleString("tr-TR",{minimumFractionDigits:0})}`}</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:32, margin:"8px 0 4px" }}>
            {sparkline.map((v,i) => (
              <div key={i} style={{ flex:1, height:`${Math.max(4,(v/maxSpark)*100)}%`, borderRadius:"1px 1px 0 0",
                background:i===6?"var(--adm-accent)":"var(--adm-surface-4)", transition:"height 0.3s" }} />
            ))}
          </div>
          <div style={{ fontSize:10, color:"var(--adm-text-4)" }}>7 günlük trend · Ort. ₺{loading?"…":stats.avgOrder.toFixed(0)}/sipariş</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat__label">30 Gün Sipariş</div>
          <div className="adm-stat__value">{loading?"…":stats.orders}</div>
          <div style={{ height:4 }} />
          <div style={{ fontSize:11, color:stats.pending>0?"var(--adm-yellow)":"var(--adm-text-4)", fontWeight:500 }}>
            {loading?"…":`${stats.pending} bekliyor`}
          </div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat__label">Aktif Ürün</div>
          <div className="adm-stat__value">{loading?"…":stats.products}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat__label">Toplam Müşteri</div>
          <div className="adm-stat__value">{loading?"…":stats.customers}</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 260px", gap:16 }}>
        {/* Son Siparişler */}
        <div className="adm-card">
          <div className="adm-card-header">
            <span className="adm-card-title">Son Siparişler</span>
            <Link href="/admin/siparisler" className="adm-btn adm-btn--ghost adm-btn--sm">Tümünü Gör →</Link>
          </div>
          {loading ? (
            <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div>
          ) : recent.length===0 ? (
            <div className="adm-empty">
              <div className="adm-empty__title">Henüz sipariş yok</div>
              İlk sipariş geldiğinde burada görünecek.
            </div>
          ) : (
            <table className="adm-table">
              <thead><tr><th>Sipariş No</th><th>Müşteri</th><th>Şehir</th><th>Tutar</th><th>Durum</th></tr></thead>
              <tbody>
                {recent.map(o => (
                  <tr key={o.id}>
                    <td><span className="adm-mono adm-font-500" style={{ color:"var(--adm-accent)" }}>{o.order_number}</span></td>
                    <td>
                      <div style={{ fontWeight:500, color:"var(--adm-text)", fontSize:12 }}>{o.full_name}</div>
                      <div style={{ fontSize:10, color:"var(--adm-text-4)" }}>{o.email}</div>
                    </td>
                    <td className="adm-text-muted" style={{ fontSize:12 }}>{o.city||"—"}</td>
                    <td><span className="adm-mono">₺{Number(o.total).toFixed(2)}</span></td>
                    <td>
                      <span className="adm-badge" style={{ background:`${STATUS_COLORS[o.status]||"var(--adm-text-3)"}18`, color:STATUS_COLORS[o.status]||"var(--adm-text-3)" }}>
                        {STATUS_TR[o.status]||o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Sağ panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Hızlı Erişim */}
          <div className="adm-card">
            <div className="adm-card-header"><span className="adm-card-title">Hızlı Erişim</span></div>
            <div style={{ padding:"6px 8px" }}>
              {[
                { label:"Yeni sipariş bekliyor", href:"/admin/siparisler", badge:stats.pending, dot:"var(--adm-yellow)" },
                { label:"Ürün ekle",             href:"/admin/urunler",    badge:0, dot:"var(--adm-accent)" },
                { label:"Kupon oluştur",         href:"/admin/kuponlar",   badge:0, dot:"var(--adm-green)" },
                { label:"Analytics",             href:"/admin/analytics",  badge:0, dot:"var(--adm-blue)" },
                { label:"Medya yükle",           href:"/admin/medya",      badge:0, dot:"var(--adm-purple)" },
                { label:"Ayarlar",               href:"/admin/ayarlar",    badge:0, dot:"var(--adm-text-4)" },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 8px", borderRadius:5, color:"var(--adm-text-2)", textDecoration:"none", fontSize:12, transition:"background 0.1s" }}
                  onMouseEnter={e => (e.currentTarget.style.background="var(--adm-surface-2)")}
                  onMouseLeave={e => (e.currentTarget.style.background="transparent")}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:l.dot, flexShrink:0 }} />
                  <span style={{ flex:1 }}>{l.label}</span>
                  {l.badge>0 && <span className="adm-nav-count">{l.badge}</span>}
                  <span style={{ fontSize:11, color:"var(--adm-text-4)" }}>→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Özet */}
          <div className="adm-card">
            <div className="adm-card-header"><span className="adm-card-title">Anlık Durum</span></div>
            <div style={{ padding:"6px 14px" }}>
              {[
                ["Bekleyen Sipariş", stats.pending, stats.pending>0?"var(--adm-yellow)":"var(--adm-text-3)"],
                ["Aktif Ürün",       stats.products, "var(--adm-text)"],
                ["Aktif Kupon",      stats.coupons,  "var(--adm-green)"],
                ["Müşteri Sayısı",   stats.customers,"var(--adm-text)"],
              ].map(([k,v,c]) => (
                <div key={String(k)} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid var(--adm-border)" }}>
                  <span style={{ fontSize:12, color:"var(--adm-text-3)" }}>{k}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:String(c), fontFamily:"var(--adm-mono)" }}>{loading?"…":v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
