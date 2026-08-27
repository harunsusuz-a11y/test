import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Sıkça Sorulan Sorular",
  description:
    "Venti-Ate ürünleri, kargo, iade ve abonelik hakkında en çok merak edilen soruların yanıtları.",
  path: "/sss",
  keywords: ["Venti-Ate SSS", "protein bar kargo", "iade koşulları", "abonelik iptal"],
});

export default async function SSSPage() {
  const settings = await getSettings(["faq_items"]);
  const faqs = ((settings.faq_items ?? []) as { question: string; answer: string }[]);


  return (
    <main>
      <section className="pt-32 pb-6 px-6 max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-brown/50 mb-2">Destek</p>
        <h1 className="font-display text-3xl text-brown">Sıkça Sorulan Sorular</h1>
      </section>
      <section className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-brown/10 pb-8 last:border-0">
            <h3 className="font-semibold text-brown text-lg mb-2">{faq.question}</h3>
            <p className="text-brown/70 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
