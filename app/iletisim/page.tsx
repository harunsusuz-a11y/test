"use server";

import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İletişim | Venti-Ate",
  description: "Bize ulaşın — sipariş, iş birliği veya her türlü soru için.",
};

export default async function IletisimPage() {
  const settings = await getSettings(["contact_email", "contact_phone", "contact_instagram", "contact_address"]);

  const email = (settings.contact_email as string) ?? "info@ventiateprotein.com";
  const phone = (settings.contact_phone as string) ?? "";
  const instagram = (settings.contact_instagram as string) ?? "";
  const address = (settings.contact_address as string) ?? "";

  return (
    <main>
      <PageHeader
        title="İletişim"
        subtitle="Her soruyu yanıtlıyoruz."
        eyebrow="Bize Ulaşın"
      />
      <section className="max-w-2xl mx-auto px-6 py-20 space-y-10">
        <div className="space-y-6">
          <div className="flex items-start gap-4 border-b border-brown/10 pb-6">
            <div>
              <p className="text-xs text-brown/50 uppercase tracking-widest mb-1">E-posta</p>
              <a href={`mailto:${email}`} className="text-brown hover:text-green transition-colors font-medium">
                {email}
              </a>
            </div>
          </div>
          {phone && (
            <div className="flex items-start gap-4 border-b border-brown/10 pb-6">
              <div>
                <p className="text-xs text-brown/50 uppercase tracking-widest mb-1">Telefon</p>
                <a href={`tel:${phone.replace(/\s/g,"")}`} className="text-brown font-medium">
                  {phone}
                </a>
              </div>
            </div>
          )}
          {instagram && (
            <div className="flex items-start gap-4 border-b border-brown/10 pb-6">
              <div>
                <p className="text-xs text-brown/50 uppercase tracking-widest mb-1">Instagram</p>
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-brown hover:text-green transition-colors font-medium">
                  @ventiate
                </a>
              </div>
            </div>
          )}
          {address && (
            <div className="flex items-start gap-4">
              <div>
                <p className="text-xs text-brown/50 uppercase tracking-widest mb-1">Adres</p>
                <p className="text-brown font-medium">{address}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-cream rounded-2xl p-8">
          <h2 className="font-display text-xl text-brown mb-4">Hızlı İletişim</h2>
          <p className="text-brown/70 text-sm leading-relaxed mb-6">
            Sipariş soruları, kurumsal alım veya iş birliği teklifleri için e-posta gönderebilir
            ya da Instagram'dan mesaj atabilirsin. 24 saat içinde yanıt veriyoruz.
          </p>
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 bg-brown text-cream px-6 py-3 rounded-full text-sm font-medium hover:bg-brown/90 transition-colors"
          >
            E-posta Gönder
          </a>
        </div>
      </section>
    </main>
  );
}
