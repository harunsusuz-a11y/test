import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormunuBulQuiz } from "@/components/quiz/FormunuBulQuiz";

export const metadata: Metadata = { title: "Formunu Bul" };

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Kısa Test" title="Formunu Bul" description="4 soruda sana en uygun Venti-Ate ürününü bulalım." />
      <div className="mx-auto max-w-4xl px-5 pb-24">
        <FormunuBulQuiz />
      </div>
    </>
  );
}
