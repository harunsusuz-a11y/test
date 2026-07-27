import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqs } from "@/content/faq";

export const metadata: Metadata = { title: "Sıkça Sorulan Sorular" };

export default function Page() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <PageHeader eyebrow="Yardım" title="Sıkça Sorulan Sorular" />
      <div className="mx-auto max-w-2xl px-5 pb-10 pt-12">
        <Accordion items={faqs} />
      </div>

      <div className="mx-auto max-w-2xl px-5 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brown/10 bg-white/60 p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green/10">
              <MessageCircle size={18} className="text-green" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display font-bold text-brown-darker">Aradığın cevabı bulamadın mı?</p>
              <p className="text-sm text-brown-dark/60">Bize doğrudan ulaş, yardımcı olalım.</p>
            </div>
          </div>
          <Link
            href="/iletisim"
            className="shrink-0 rounded-full bg-brown px-6 py-2.5 text-sm font-bold text-cream transition hover:bg-green"
          >
            İletişime Geç
          </Link>
        </div>
      </div>
    </>
  );
}
