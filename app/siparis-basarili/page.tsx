import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = { title: "Sipariş Başarılı" };

export default function Page() {
  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <CheckCircle2 size={56} className="mx-auto text-green" aria-hidden="true" />
      <h1 className="mt-6 font-display text-3xl font-extrabold text-brown-darker">Siparişin alındı!</h1>
      <p className="mt-3 text-brown-dark/70">
        Bu bir demo siparişidir, gerçek bir tahsilat yapılmamıştır. Gerçek ödeme sağlayıcısı entegre edildiğinde bu
        akış canlıya alınabilir.
      </p>
      <Link
        href="/magaza"
        className="mt-8 inline-block rounded-full bg-brown px-7 py-3.5 text-sm font-bold text-cream transition hover:bg-green"
      >
        Alışverişe Devam Et
      </Link>
    </div>
  );
}
