import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubscriptionFlow } from "@/components/subscription/SubscriptionFlow";

export const metadata: Metadata = {
  title: "Abonelik",
  description: "Venti-Ate ürünlerini düzenli aralıklarla kapına kadar getir.",
};

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Abonelik"
        title="Fındığın Hiç Bitmesin."
        description="Ürününü, sıklığını ve miktarını seç — teslimatı dilediğin zaman değiştir, ertele ya da durdur."
      />
      <div className="mx-auto max-w-4xl px-5 pb-24">
        <SubscriptionFlow />
      </div>
    </>
  );
}
