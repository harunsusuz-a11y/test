"use server";

import { getSettings } from "@/lib/settings";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular | Venti-Ate",
  description: "Venti-Ate ürünleri, kargo, iade ve abonelik hakkında merak ettiklerin.",
};

export default async function SSSPage() {
  const settings = await getSettings(["faq_items"]);
  const faqs: { question: string; answer: string }[] = 
    (settings.faq_items as { question: string; answer: string }[]) ?? [];

  return (
    <LegalPageLayout title="Sıkça Sorulan Sorular">
      <div className="space-y-8">
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-brown/10 pb-8 last:border-0">
            <h3 className="font-semibold text-brown text-lg mb-2">{faq.question}</h3>
            <p className="text-brown/70 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </LegalPageLayout>
  );
}
