import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/forms/ContactForm";
import { brand } from "@/content/brand";

export const metadata: Metadata = { title: "İletişim" };

const contactItems = [
  { icon: Mail, label: "E-posta", value: brand.contact.email },
  { icon: Phone, label: "Telefon", value: brand.contact.phone },
  { icon: MapPin, label: "Adres", value: brand.contact.address },
];

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Bize Ulaşın" title="İletişim" description="Sorun, önerin veya iş birliği talebin mi var? Aşağıdaki formu doldur, dönüş yapalım." />
      <div className="mx-auto grid max-w-4xl gap-10 px-5 pb-20 md:grid-cols-2">
        <div>
          <h2 className="mb-5 font-display text-lg font-bold text-brown-darker">İletişim Bilgileri</h2>
          <div className="space-y-3">
            {contactItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 rounded-2xl border border-brown/10 bg-white/60 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green/10">
                  <Icon size={16} className="text-green" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brown-dark/50">{label}</p>
                  <p className="mt-0.5 break-words text-sm font-medium text-brown-darker">{value}</p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3 rounded-2xl border border-brown/10 bg-white/60 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green/10">
                <Clock size={16} className="text-green" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brown-dark/50">Yanıt Süresi</p>
                <p className="mt-0.5 text-sm font-medium text-brown-darker">
                  [ORTALAMA YANIT SÜRESİ EKLENECEK] <span className="text-brown-dark/40">(demo)</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <ContactForm />
      </div>
    </>
  );
}
