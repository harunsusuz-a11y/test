import type { Metadata } from "next";
import { Clock, Target, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormunuBulQuiz } from "@/components/quiz/FormunuBulQuiz";
import { getProductsServer } from "@/lib/data/products-server";

export const metadata: Metadata = buildMetadata({
  title: "Formunu Bul",
  description:
    "4 soruda sana en uygun Venti-Ate ürününü bul. Hedefine göre protein bar mı, fındık kreması mı daha iyi?",
  path: "/formunu-bul",
  keywords: ["hangi ürün benim için doğru", "protein bar mı krema mı", "fındık ürün testi"],
});

const BENEFITS = [
  { Icon: Clock, label: "4 Soruluk Test", desc: "1 dakikada tamamlanır" },
  { Icon: Target, label: "Kişisel Sonuç", desc: "Hedefine özel öneri" },
  { Icon: Sparkles, label: "Doğru Ürün", desc: "Deneme yanılma yok" },
];

async function QuizSection() {
  const products = await getProductsServer();
  return <FormunuBulQuiz products={products} />;
}

export default function FormunuBulPage() {
  return (
    <>
      <PageHeader eyebrow="Kısa Test" title="Formunu Bul" description="4 soruda sana en uygun Venti-Ate ürününü bulalım." />
      <div className="mx-auto max-w-xl px-5 py-12 grid grid-cols-3 gap-4 text-center">
        {BENEFITS.map(({ Icon, label, desc }) => (
          <span key={label} className="flex flex-col items-center gap-1">
            <Icon size={14} className="text-green" aria-hidden="true" />
            <span className="text-xs font-semibold text-brown-darker">{label}</span>
            <span className="text-[10px] text-brown-dark/60">{desc}</span>
          </span>
        ))}
      </div>
      <div className="mx-auto max-w-4xl px-5 pb-24">
        <QuizSection />
      </div>
    </>
  );
}
