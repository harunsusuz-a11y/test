"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/ui/Toast";
import { SkeletonCard } from "@/components/admin/ui/Skeleton";
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, RotateCcw, Save, Plus } from "lucide-react";

type OrderDetail = {
  id: string; order_number: string; full_name: string; email: string; phone: string | null;
  address: string | null; city: string | null; postal_code: string | null;
  status: string; payment_status: string | null; payment_method: string | null;
  shipping_company: string | null; tracking_number: string | null;
  subtotal: number; discount: number | null; shipping_cost: number; total: number;
  coupon_code: string | null; customer_note: string | null; admin_note: string | null;
  created_at: string; updated_at: string | null;
};
type OrderItem = { id:string; product_slug:string|null; product_name:string|null; variant_id:string|null; quantity:number; unit_price:number; total_price?:number; image?:string|null };
type StatusHistory = { id:string; new_status:string; changed_by:string|null; created_at:string };

const STATUS_TR: Record<string,string> = { pending:"Bekliyor", confirmed:"Onaylandı", processing:"Hazırlanıyor", shipped:"Kargoya Verildi", delivered:"Teslim Edildi", cancelled:"İptal", refunded:"İade" };
const STATUS_C: Record<string,string> = { pending:"#f59e0b", confirmed:"#60a5fa", processing:"#a78bfa", shipped:"#c8a26b", delivered:"#4ade80", cancelled:"#f87171", refunded:"#9b9ba4" };

export default function SiparisDetayPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingInput, setTrackingInput] = useState("");
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const [orderRes, itemsRes, historyRes] = await Promise.all([
      supabase.from("orders").select("*").eq("id", id).single(),
      supabase.from("order_items").select("*").eq("order_id", id),
      supabase.from("order_status_history").select("*").eq("order_id", id).order("created_at", {ascending:false}),
    ]);
    if (orderRes.data) {
      setOrder(orderRes.data as OrderDetail);
      setTrackingInput(orderRes.data.tracking_number ?? "");
      setAdminNoteInput(orderRes.data.admin_note ?? "");
    }
    setItems((itemsRes.data ?? []) as OrderItem[]);
    setHistory((historyRes.data ?? []) as StatusHistory[]);
    setLoading(false);
  }, [supabase, id]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(status: string) {
    setSaving(true);
    try {
      await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
      await supabase.from("order_status_history").insert({ order_id: id, new_status: status, created_at: new Date().toISOString() });
      success("Durum güncellendi", STATUS_TR[status]);
      load();
    } catch { toastError("Hata", "Durum güncellenemedi."); }
    setSaving(false);
  }

  async function saveTracking() {
    setSaving(true);
    await supabase.from("orders").update({ tracking_number: trackingInput || null }).eq("id", id);
    success("Kargo takip numarası kaydedildi");
    setSaving(false);
  }

  async function saveNote() {
    setSaving(true);
    await supabase.from("orders").update({ admin_note: adminNoteInput || null }).eq("id", id);
    success("Not kaydedildi");
    setSaving(false);
  }

  const sectionStyle: React.CSSProperties = { background:"#1a1a1f", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:20, marginBottom:16 };
  const inputStyle: React.CSSProperties = { background:"#0f0f12", border:"1px solid rgba(255,255,255,0.1)", borderRadius:7, color:"#f2f2f3", fontSize:13, padding:"8px 12px", width:"100%", boxSizing:"border-box" };
  const labelStyle: React.CSSProperties = { fontSize:11, color:"#6b6b76", display:"block", marginBottom:4, textTransform:"uppercase" as "uppercase", letterSpacing:.5 };

  if (loading) return (
    <div style={{ padding:24 }}>
      <SkeletonCard lines={8} />
    </div>
  );

  if (!order) return (
    <div style={{ padding:24, textAlign:"center", color:"#6b6b76" }}>
      <p>Sipariş bulunamadı.</p>
      <button onClick={() => router.back()} style={{ marginTop:12, padding:"8px 16px", borderRadius:7, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#9b9ba4", cursor:"pointer" }}>Geri Dön</button>
    </div>
  );

  return (
    <div style={{ padding:24, maxWidth:1100 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <button onClick={() => router.back()}
          style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"7px 10px", color:"#9b9ba4", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
          <ArrowLeft size={14}/> Geri
        </button>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700, color:"#f2f2f3", margin:0 }}>{order.order_number}</h1>
          <p style={{ fontSize:12, color:"#6b6b76", margin:"2px 0 0" }}>{new Date(order.created_at).toLocaleString("tr-TR")}</p>
        </div>
        <span style={{ marginLeft:"auto", fontSize:13, fontWeight:700, color:STATUS_C[order.status]??"#9b9ba4",
          background:`${STATUS_C[order.status]??"#9b9ba4"}18`, padding:"5px 14px", borderRadius:20 }}>
          {STATUS_TR[order.status] ?? order.status}
        </span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16 }}>
        {/* Sol kolon */}
        <div>
          {/* Sipariş Ürünleri */}
          <div style={sectionStyle}>
            <p style={{ fontSize:14, fontWeight:600, color:"#f2f2f3", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
              <Package size={15} color="#c8a26b"/> Sipariş Ürünleri
            </p>
            {items.length === 0 ? <p style={{ color:"#6b6b76", fontSize:13 }}>Ürün bulunamadı.</p> : (
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                    {["Ürün","Adet","Birim Fiyat","Toplam"].map(h => <th key={h} style={{ textAlign:"left", padding:"6px 8px", fontSize:11, color:"#6b6b76", fontWeight:500 }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding:"10px 8px", fontSize:13, color:"#f2f2f3" }}>{item.product_name ?? "Ürün"}</td>
                      <td style={{ padding:"10px 8px", fontSize:13, color:"#9b9ba4" }}>{item.quantity}</td>
                      <td style={{ padding:"10px 8px", fontSize:13 }}>₺{Number(item.unit_price).toFixed(2)}</td>
                      <td style={{ padding:"10px 8px", fontSize:13, fontWeight:600, color:"#f2f2f3" }}>₺{(Number(item.unit_price) * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* Özet */}
            <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", marginTop:12, paddingTop:12 }}>
              {[
                { label:"Ara toplam", value:`₺${Number(order.subtotal ?? 0).toFixed(2)}` },
                order.discount ? { label:"İndirim", value:`-₺${Number(order.discount).toFixed(2)}`, color:"#4ade80" } : null,
                order.coupon_code ? { label:`Kupon (${order.coupon_code})`, value:"Uygulandı", color:"#4ade80" } : null,
                { label:"Kargo", value:`₺${Number(order.shipping_cost ?? 0).toFixed(2)}` },
              ].filter(Boolean).map((row, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:(row as {color?:string}).color ?? "#9b9ba4", marginBottom:4 }}>
                  <span>{(row as {label:string}).label}</span>
                  <span>{(row as {value:string}).value}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:15, fontWeight:700, color:"#f2f2f3", borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:8, marginTop:8 }}>
                <span>Genel Toplam</span>
                <span>₺{Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Kargo */}
          <div style={sectionStyle}>
            <p style={{ fontSize:14, fontWeight:600, color:"#f2f2f3", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
              <Truck size={15} color="#c8a26b"/> Kargo Bilgisi
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <div>
                <span style={labelStyle}>Kargo Firması</span>
                <p style={{ fontSize:13, color:"#f2f2f3", margin:0 }}>{order.shipping_company ?? "-"}</p>
              </div>
              <div>
                <span style={labelStyle}>Ödeme Yöntemi</span>
                <p style={{ fontSize:13, color:"#f2f2f3", margin:0 }}>{order.payment_method ?? "Kart"}</p>
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <input style={{ ...inputStyle, flex:1 }} value={trackingInput}
                onChange={e => setTrackingInput(e.target.value)} placeholder="Kargo takip numarası" />
              <button onClick={saveTracking} disabled={saving}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:7, background:"#c8a26b", border:"none", color:"#000", cursor:"pointer", fontWeight:700, fontSize:13, whiteSpace:"nowrap" as "nowrap" }}>
                <Save size={13}/> Kaydet
              </button>
            </div>
          </div>

          {/* Admin Notu */}
          <div style={sectionStyle}>
            <p style={{ fontSize:14, fontWeight:600, color:"#f2f2f3", marginBottom:10 }}>Admin Notu</p>
            {order.customer_note && (
              <div style={{ background:"rgba(96,165,250,0.08)", border:"1px solid rgba(96,165,250,0.2)", borderRadius:7, padding:"8px 12px", marginBottom:10, fontSize:13, color:"#9b9ba4" }}>
                <span style={{ fontSize:11, color:"#60a5fa", fontWeight:600 }}>MÜŞTERİ NOTU: </span>{order.customer_note}
              </div>
            )}
            <textarea style={{ ...inputStyle, minHeight:80, resize:"vertical" as "vertical" }}
              value={adminNoteInput} onChange={e => setAdminNoteInput(e.target.value)} placeholder="İç not ekle…" />
            <button onClick={saveNote} disabled={saving}
              style={{ marginTop:8, display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:7, background:"rgba(200,162,107,0.15)", border:"1px solid rgba(200,162,107,0.3)", color:"#c8a26b", cursor:"pointer", fontSize:13, fontWeight:600 }}>
              <Plus size={13}/> Notu Kaydet
            </button>
          </div>
        </div>

        {/* Sağ kolon */}
        <div>
          {/* Müşteri Bilgisi */}
          <div style={sectionStyle}>
            <p style={{ fontSize:14, fontWeight:600, color:"#f2f2f3", marginBottom:14 }}>Müşteri</p>
            <div style={{ display:"flex", flexDirection:"column" as "column", gap:8 }}>
              {[
                { label:"Ad Soyad", value:order.full_name },
                { label:"E-posta", value:order.email },
                { label:"Telefon", value:order.phone ?? "-" },
              ].map(r => (
                <div key={r.label}>
                  <span style={labelStyle}>{r.label}</span>
                  <p style={{ fontSize:13, color:"#f2f2f3", margin:0 }}>{r.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Teslimat Adresi */}
          <div style={sectionStyle}>
            <p style={{ fontSize:14, fontWeight:600, color:"#f2f2f3", marginBottom:10 }}>Teslimat Adresi</p>
            <p style={{ fontSize:13, color:"#9b9ba4", margin:0, lineHeight:1.6 }}>
              {order.address ?? "-"}<br/>
              {order.city && `${order.city}, `}{order.postal_code}
            </p>
          </div>

          {/* Durum Güncelle */}
          <div style={sectionStyle}>
            <p style={{ fontSize:14, fontWeight:600, color:"#f2f2f3", marginBottom:14 }}>Durum Değiştir</p>
            <div style={{ display:"flex", flexDirection:"column" as "column", gap:6 }}>
              {Object.entries(STATUS_TR).map(([val, label]) => (
                <button key={val} onClick={() => updateStatus(val)} disabled={saving || order.status === val}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderRadius:8,
                    border: order.status===val ? `1px solid ${STATUS_C[val]}` : "1px solid rgba(255,255,255,0.06)",
                    background: order.status===val ? `${STATUS_C[val]}22` : "transparent",
                    color: order.status===val ? STATUS_C[val] : "#9b9ba4",
                    cursor: order.status===val || saving ? "not-allowed":"pointer",
                    fontSize:13, textAlign:"left" as "left", opacity: saving ? .6:1 }}>
                  {order.status===val ? <CheckCircle size={14}/> : <div style={{ width:14,height:14,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.1)" }}/>}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Durum Geçmişi */}
          <div style={sectionStyle}>
            <p style={{ fontSize:14, fontWeight:600, color:"#f2f2f3", marginBottom:12 }}>Durum Geçmişi</p>
            {history.length === 0 ? <p style={{ fontSize:13, color:"#6b6b76" }}>Geçmiş yok.</p> : history.map(h => (
              <div key={h.id} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:12 }}>
                <span style={{ color:STATUS_C[h.new_status]??"#9b9ba4", fontWeight:600 }}>{STATUS_TR[h.new_status] ?? h.new_status}</span>
                <span style={{ color:"#6b6b76" }}>{new Date(h.created_at).toLocaleDateString("tr-TR")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
