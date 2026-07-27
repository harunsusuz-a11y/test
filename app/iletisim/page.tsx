import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, Instagram, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/forms/ContactForm";
import { Reveal } from "@/components/animations/Reveal";
import { brand } from "@/content/brand";

export const metadata: Metadata = { title: "İletişim" };

const contactItems = [
  { icon: Mail, label: "E-posta", value: brand.contact.email },
  { icon: Phone, label: "Telefon", value: brand.contact.phone },
  { icon: MapPin, label: "Adres", value: brand.contact.address },
  { icon: Clock, label: "Yanıt Süresi", value: "[ORTALAMA YANIT SÜRESİ EKLENECEK] (demo)" },
];

/**
 * Split editorial iletişim: solda koyu marka paneli (bilgiler + SSS yönlendirmesi),
 * sağda krem zeminde form. İki kolon desktop'ta aynı kartın iki yüzü gibi durur.
 */
export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Bize Ulaşın"
        title="Konuşalım."
        description="Soru, öneri veya iş birliği — hangisi olursa olsun, gerçek bir insan okuyor."
      />

      <div className="mx-auto max-w-6xl px-5 pb-24 pt-12">
        <Reveal>
          <div className="grid overflow-hidden rounded-[2rem] border border-brown/10 shadow-xl shadow-brown-darker/5 md:grid-cols-[1fr_1.2fr]">
            {/* Koyu panel */}
            <div className="relative bg-brown-darker p-8 text-cream sm:p-10">
              <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]">
                <filter id="contact-grain">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#contact-grain)" />
              </svg>
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-widest2 text-peach">İletişim Bilgileri</p>
                <h2 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">
                  İlk ısırıktan sonra aklına takılan her şey.
                </h2>

                <div className="mt-8 space-y-5">
                  {contactItems.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-peach/15">
                        <Icon size={16} className="text-peach" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-widest2 text-cream/50">{label}</p>
                        <p className="mt-0.5 break-words text-sm font-medium text-cream/90">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 border-t border-cream/10 pt-6">
                  <p className="text-sm text-cream/60">Cevabın hazır olabilir:</p>
                  <Link
                    href="/sss"
                    className="group mt-2 inline-flex items-center gap-2 text-sm font-bold text-peach"
                  >
                    Sıkça Sorulan Sorular
                    <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <p className="mt-6 flex items-center gap-2 text-xs text-cream/50">
                    <Instagram size={14} aria-hidden="true" />
                    {brand.social.instagram.startsWith("[") ? "@ventiate (demo)" : brand.social.instagram}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white/60 p-8 sm:p-10">
              <p className="text-xs font-bold uppercase tracking-widest2 text-green">Mesaj Gönder</p>
              <h2 className="mb-6 mt-2 font-display text-2xl font-extrabold text-brown-darker">
                Formu doldur, dönüş yapalım.
              </h2>
              <ContactForm />
            </div>
          </div>
        </Reveal>
      </div>
    </>
  );
}
