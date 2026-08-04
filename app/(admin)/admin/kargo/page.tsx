"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface ShippingCompany { id:string; name:string; code:string; tracking_url:string|null; is_active:boolean; }
interface ShippingRate { id:string; zone_id:string; name:string; min_value:number; max_value:number|null; min_cart:number; price:number; free_shipping_threshold:number|null; is_active:boolean; company?:{name:string}|null; }

export default function AdminKargo() {
  const [companies, setCompanies] = useState<ShippingCompany[]>([]);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"companies"|"rates">("companies");
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data:c },{ data:r }] = await Promise.all([
      supabase.from("shipping_companies").select("*").order("name"),
      supabase.from("shipping_rates").select("*, company:zone_id(name)").order("price"),
    ]);
    setCompanies((c as ShippingCompany[])||[]);
    setRates((r as ShippingRate[])||[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function toggleCompany(id:string, val:boolean) {
    await supabase.from("shipping_companies").update({ is_active:val }).eq("id",id);
    setCompanies(prev => prev.map(c => c.id===id?{...c,is_active:val}:c));
  }

  async function toggleRate(id:string, val:boolean) {
    await supabase.from("shipping_rates").update({ is_active:val }).eq("id",id);
    setRates(prev => prev.map(r => r.id===id?{...r,is_active:val}:r));
  }

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">Kargo Yönetimi</div></div>
      </div>

      <div className="adm-tabs" style={{ marginBottom:20 }}>
        <button className={`adm-tab${tab==="companies"?" active":""}`} onClick={()=>setTab("companies")}>Kargo Firmaları ({companies.length})</button>
        <button className={`adm-tab${tab==="rates"?" active":""}`} onClick={()=>setTab("rates")}>Kargo Tarifeleri ({rates.length})</button>
      </div>

      {loading ? <div className="adm-card"><div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div></div> : (
        <>
          {tab==="companies" && (
            <div className="adm-card">
              <table className="adm-table">
                <thead><tr><th>Firma</th><th>Kod</th><th>Takip URL</th><th>Durum</th></tr></thead>
                <tbody>
                  {companies.map(c => (
                    <tr key={c.id}>
                      <td className="adm-td--strong">{c.name}</td>
                      <td className="adm-mono adm-text-muted">{c.code}</td>
                      <td>{c.tracking_url?<a href={c.tracking_url} target="_blank" style={{ color:"var(--adm-accent)", fontSize:11 }}>↗ Takip</a>:"—"}</td>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div className={`adm-toggle${c.is_active?" on":""}`} onClick={() => toggleCompany(c.id,!c.is_active)} />
                          <span style={{ fontSize:11, color:"var(--adm-text-3)" }}>{c.is_active?"Aktif":"Pasif"}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {companies.length===0 && <tr><td colSpan={4}><div className="adm-empty"><div className="adm-empty__title">Kargo firması yok</div></div></td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {tab==="rates" && (
            <div className="adm-card">
              <table className="adm-table">
                <thead><tr><th>Firma</th><th>Tarife Adı</th><th>Min. Ağırlık</th><th>Maks. Ağırlık</th><th>Fiyat</th><th>Ücretsiz Kargo</th><th>Durum</th></tr></thead>
                <tbody>
                  {rates.map(r => (
                    <tr key={r.id}>
                      <td className="adm-td--strong">{(r.company as any)?.name||"—"}</td>
                      <td className="adm-text-muted">{r.name}</td>
                      <td className="adm-mono adm-text-muted">{r.min_value}g</td>
                      <td className="adm-mono adm-text-muted">{r.max_value?`${r.max_value}g`:"Limitsiz"}</td>
                      <td className="adm-mono adm-font-500">₺{Number(r.price).toFixed(2)}</td>
                      <td className="adm-mono adm-text-muted">{r.free_shipping_threshold?`₺${r.free_shipping_threshold}+`:"—"}</td>
                      <td>
                        <div className={`adm-toggle${r.is_active?" on":""}`} onClick={() => toggleRate(r.id,!r.is_active)} />
                      </td>
                    </tr>
                  ))}
                  {rates.length===0 && <tr><td colSpan={7}><div className="adm-empty"><div className="adm-empty__title">Kargo tarifesi yok</div></div></td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
