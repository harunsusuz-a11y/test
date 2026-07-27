import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Hesabım" };

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Hesabım" title="Hesap Bilgilerim" />
      <div className="mx-auto max-w-md px-5 pb-24">
        <div className="rounded-2xl border border-brown/10 bg-white/60 p-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brown/5">
            <Lock size={20} className="text-brown-dark/50" aria-hidden="true" />
          </span>
          <h2 className="font-display text-lg font-bold text-brown-darker">Giriş sistemi yakında</h2>
          <p className="mt-2 text-sm text-brown-dark/70">
            Hesap girişi/kayıt, profil bilgileri, adres defteri ve şifre yönetimi için gerçek bir kimlik
            doğrulama (auth) altyapısı gerekiyor — bu henüz siteye bağlanmadı.
          </p>

          <div className="mt-6 space-y-3 text-left opacity-50">
            <input
              disabled
              placeholder="E-posta"
              className="w-full rounded-xl border border-brown/20 px-4 py-3 text-sm"
            />
            <input
              disabled
              placeholder="Şifre"
              type="password"
              className="w-full rounded-xl border border-brown/20 px-4 py-3 text-sm"
            />
            <button disabled className="w-full rounded-full bg-brown-darker px-6 py-3 text-sm font-bold text-cream">
              Giriş Yap
            </button>
          </div>
          <p className="mt-4 text-xs text-brown-dark/40">Yukarıdaki form şu an devre dışı — yalnızca önizlemedir.</p>
        </div>
      </div>
    </>
  );
}
