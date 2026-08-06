import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sipariş Tamamlandı",
  robots: { index: false, follow: false },
};

import { Suspense } from "react";
import { SiparisBasariliContent } from "./SiparisBasariliContent";

export default function SiparisBasariliPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:"70vh", display:"flex", alignItems:"center", justifyContent:"center" }}><p style={{ color:"#9b9ba4" }}>Yükleniyor…</p></div>}>
      <SiparisBasariliContent />
    </Suspense>
  );
}
