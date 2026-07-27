import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Hesabım" };

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Hesabım" title="Hesap Bilgilerim" />
      <div className="mx-auto max-w-lg px-5 pb-24 text-center">
        <div role="note" className="rounded-xl border border-peach/60 bg-peach/15 px-5 py-4 text-sm text-brown-dark">
          Hesap girişi/kayıt sistemi henüz bağlanmadı — bu, gerçek bir kimlik doğrulama (auth) altyapısı
          gerektirir. Bu sayfa, altyapı eklendiğinde profil bilgileri, adres defteri ve şifre yönetimi için
          hazır bir yer tutucudur.
        </div>
      </div>
    </>
  );
}
