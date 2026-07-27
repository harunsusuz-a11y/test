import type { Metadata } from "next";
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
      <div className="mx-auto max-w-2xl px-5 pb-20">
        <Accordion items={faqs} />
      </div>
    </>
  );
}
