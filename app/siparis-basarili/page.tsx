"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

export default function SiparisBasarili() {
  const params = useSearchParams();
  const orderId = params.get("siparis");
  const [count, setCount] = useState(5);

  useEffect(() => {
    const t = setInterval(() => setCount(c => c - 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (count <= 0) window.location.href = "/magaza";
  }, [count]);

  return (
    <div style={{ minHeight:"70vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
      <div style={{ textAlign:"center", maxWidth:480 }}>
        <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(65,93,31,0.12)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" }}>
          <CheckCircle size={40} color="#415D1F" />
        </div>
        <h1 style={{ fontSize:28, fontWeight:800, color:"#56312D", marginBottom:8 }}>Siparişiniz Alındı!</h1>
        {orderId && (
          <p style={{ fontSize:14, color:"#6b6b76", marginBottom:8 }}>
            Sipariş numaranız: <strong style={{ color:"#415D1F", fontFamily:"monospace" }}>{orderId}</strong>
          </p>
        )}
        <p style={{ fontSize:15, color:"#56312D", opacity:.7, marginBottom:32 }}>
          Siparişiniz onaylandı. Kargo bilgileri e-posta adresinize gönderilecek.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" as "wrap" }}>
          <Link href="/siparislerim"
            style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 24px", borderRadius:50, background:"#56312D", color:"#FFF6F0", textDecoration:"none", fontWeight:700, fontSize:14 }}>
            <Package size={16}/> Siparişlerim
          </Link>
          <Link href="/magaza"
            style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 24px", borderRadius:50, border:"2px solid #56312D", color:"#56312D", textDecoration:"none", fontWeight:700, fontSize:14 }}>
            Alışverişe Devam <ArrowRight size={16}/>
          </Link>
        </div>
        <p style={{ marginTop:24, fontSize:12, color:"#9b9ba4" }}>
          {count > 0 ? `${count} saniye içinde mağazaya yönlendirileceksiniz…` : "Yönlendiriliyor…"}
        </p>
      </div>
    </div>
  );
}
