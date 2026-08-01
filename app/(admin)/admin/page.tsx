"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Stats { totalOrders:number; pendingOrders:number; totalRevenue:number; totalProducts:number; totalCustomers:number; totalCoupons:number; }
interface RecentOrder { id:string; order_number:string; status:string; total:number; created_at:string; customer?:any; }

const STATUS_MAP: Record<string,string> = { pending:"adm-badge--yellow", preparing:"adm-badge--blue", shipped:"adm-badge--blue", delivered:"adm-badge--green", cancelled:"adm-badge--red", refunded:"adm-badge--red" };
const STATUS_TR: Record<string,string> = { pending:"Bekliyor", payment_pending:"Ödeme", preparing:"Hazırlanıyor", shipped:"Kargoda", delivered:"Teslim", cancelled:"İptal", refunded:"İade" };

const WEEK = [22,38,31,45,28,52,41];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalOrders:0, pendingOrders:0, totalRevenue:0, totalProducts:0, totalCustomers:0, totalCoupons:0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [orders, products, customers, coupons, recent] = await Promise.all([
        supabase.from("orders").select("status, total"),
        supabase.from("products").select("id").is("deleted_at",null).eq("status","active"),
        supabase.from("customers").select("id"),
        supabase.from("coupons").select("id").eq("is_active",true),
        supabase.from("orders").select("*, customer:customer_id(profile:id(first_name,last_name,email))").order("created_at",{ascending:false}).limit(6),
      ]);
      const o = orders.data || [];
      setStats({
        totalOrders: o.length,
        pendingOrders: o.filter((x:any)=>["pending","payment_pending","preparing"].includes(x.status)).length,
        totalRevenue: o.filter((x:any)=>x.status!=="cancelled"&&x.status!=="refunded").reduce((s:number,x:any)=>s+Number(x.total),0),
        totalProducts: products.data?.length||0,
        totalCustomers: customers.data?.length||0,
        totalCoupons: coupons.data?.length||0,
      });
      setRecentOrders((recent.data as RecentOrder[]) || []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const maxBar = Math.max(...WEEK);

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
        <div className="adm-stat" style={{ borderColor:"rgba(200,162,107,0.2)" }}>
          <div className="adm-stat__label">Toplam Gelir</div>
          <div className="adm-stat__value">{loading?"…":`₺${stats.totalRevenue.toLocaleString("tr-TR",{minimumFractionDigits:0})}`}</div>
          <div className="adm-chart-area" style={{ height:36, margin:"8px 0 6px" }}>
            {WEEK.map((h,i) => <div key={i} className={`adm-bar${i===WEEK.length-1?" adm-bar--active":""}`} style={{ height:`${(h/maxBar)*100}%` }} />)}
          </div>
          <div className="adm-stat__change adm-stat__change--up">Bu ay</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat__label">Toplam Sipariş</div>
          <div className="adm-stat__value">{loading?"…":stats.totalOrders}</div>
          <div style={{ height:6 }} />
          <div className="adm-stat__change adm-stat__change--yellow">{stats.pendingOrders} bekliyor</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat__label">Aktif Ürün</div>
          <div className="adm-stat__value">{loading?"…":stats.totalProducts}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat__label">Toplam Müşteri</div>
          <div className="adm-stat__value">{loading?"…":stats.totalCustomers}</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:16 }}>
        {/* Son Siparişler */}
        <div className="adm-card">
          <div className="adm-card-header">
            <span className="adm-card-title">Son Siparişler</span>
            <Link href="/admin/siparisler" className="adm-btn adm-btn--ghost adm-btn--sm">Tümü →</Link>
          </div>
          {loading ? (
            <div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div>
          ) : (
            <table className="adm-table">
              <thead><tr><th>Sipariş No</th><th>Müşteri</th><th>Toplam</th><th>Durum</th><th>Tarih</th></tr></thead>
              <tbody>
                {recentOrders.length===0 ? (
                  <tr><td colSpan={5}><div className="adm-empty"><div className="adm-empty__title">Henüz sipariş yok</div>Siparişler burada görünecek.</div></td></tr>
                ) : recentOrders.map(o => {
                  const p = (o.customer as any)?.profile;
                  return (
                    <tr key={o.id}>
                      <td className="adm-mono" style={{ color:"var(--adm-accent)" }}>{o.order_number}</td>
                      <td className="adm-td--strong">{p?`${p.first_name} ${p.last_name}`:"—"}</td>
                      <td className="adm-mono">₺{Number(o.total).toFixed(2)}</td>
                      <td><span className={`adm-badge ${STATUS_MAP[o.status]||"adm-badge--muted"}`}>{STATUS_TR[o.status]||o.status}</span></td>
                      <td style={{ fontSize:11, color:"var(--adm-text-4)" }}>{new Date(o.created_at).toLocaleDateString("tr-TR")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Sağ Panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Hızlı Erişim */}
          <div className="adm-card">
            <div className="adm-card-header"><span className="adm-card-title">Hızlı Erişim</span></div>
            <div style={{ padding:"8px 8px" }}>
              {[
                { label:"Yeni ürün ekle", href:"/admin/urunler", dot:"var(--adm-accent)" },
                { label:"Siparişleri yönet", href:"/admin/siparisler", dot:"var(--adm-blue)", badge:stats.pendingOrders>0?String(stats.pendingOrders):null },
                { label:"Kupon oluştur", href:"/admin/kuponlar", dot:"var(--adm-green)" },
                { label:"İçerik düzenle", href:"/admin/icerik", dot:"var(--adm-purple)" },
                { label:"Loglar", href:"/admin/loglar", dot:"var(--adm-text-4)" },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 8px", borderRadius:5, color:"var(--adm-text-2)", textDecoration:"none", fontSize:12, transition:"background 0.1s" }}
                  onMouseEnter={e => (e.currentTarget.style.background="var(--adm-surface-2)")}
                  onMouseLeave={e => (e.currentTarget.style.background="transparent")}
                >
                  <span style={{ width:6, height:6, borderRadius:"50%", background:l.dot, flexShrink:0 }} />
                  <span style={{ flex:1 }}>{l.label}</span>
                  {l.badge && <span className="adm-nav-count" style={{ fontSize:9 }}>{l.badge}</span>}
                  <span style={{ fontSize:11, color:"var(--adm-text-4)" }}>→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Özet İstatistik */}
          <div className="adm-card">
            <div className="adm-card-header"><span className="adm-card-title">Özet</span></div>
            <div style={{ padding:"8px 14px" }}>
              {[
                ["Aktif Kupon", `${stats.totalCoupons}`],
                ["Bekleyen Sipariş", `${stats.pendingOrders}`],
                ["Toplam Müşteri", `${stats.totalCustomers}`],
              ].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid var(--adm-border)" }}>
                  <span style={{ fontSize:12, color:"var(--adm-text-3)" }}>{k}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:"var(--adm-text)", fontFamily:"var(--adm-mono)" }}>{loading?"…":v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
