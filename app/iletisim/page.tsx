import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/forms/ContactForm";
import { brand } from "@/content/brand";

export const metadata: Metadata = { title: "İletişim" };

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Bize Ulaşın" title="İletişim" />
      <div className="mx-auto grid max-w-4xl gap-10 px-5 pb-20 md:grid-cols-2">
        <div>
          <h2 className="font-display text-lg font-bold text-brown-darker">İletişim Bilgileri</h2>
          <ul className="mt-4 space-y-2 text-sm text-brown-dark/80">
            <li>E-posta: {brand.contact.email}</li>
            <li>Telefon: {brand.contact.phone}</li>
            <li>Adres: {brand.contact.address}</li>
          </ul>
        </div>
        <ContactForm />
      </div>
    </>
  );
}
