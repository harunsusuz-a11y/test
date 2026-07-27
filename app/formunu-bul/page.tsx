import type { Metadata } from "next";
import { Clock, Target, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormunuBulQuiz } from "@/components/quiz/FormunuBulQuiz";

export const metadata: Metadata = { title: "Formunu Bul" };

const points = [
  { icon: Clock, label: "30 saniye" },
  { icon: Target, label: "4 kısa soru" },
  { icon: Sparkles, label: "Sana özel öneri" },
];

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Kısa Test" title="Formunu Bul" description="4 soruda sana en uygun Venti-Ate ürününü bulalım." />
      <div className="mx-auto mb-10 flex max-w-md flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 pt-12">
        {points.map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs font-semibold text-brown-dark/60">
            <Icon size={14} className="text-green" aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
      <div className="mx-auto max-w-4xl px-5 pb-24">
        <FormunuBulQuiz />
      </div>
    </>
  );
}
