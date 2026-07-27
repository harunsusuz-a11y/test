import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubscriptionFlow } from "@/components/subscription/SubscriptionFlow";
import { RefreshCw, PauseCircle, Percent, Truck } from "lucide-react";
import { Reveal } from "@/components/animations/Reveal";

export const metadata: Metadata = {
  title: "Abonelik",
  description: "Venti-Ate ürünlerini düzenli aralıklarla kapına kadar getir.",
};

const benefits = [
  { icon: Percent, label: "%10 Abonelik İndirimi", description: "Her teslimatta otomatik uygulanır" },
  { icon: RefreshCw, label: "Ürünü Kolayca Değiştir", description: "İstediğin an ürün veya sıklık değiştir" },
  { icon: PauseCircle, label: "İstediğin Zaman Durdur", description: "Taahhüt yok, tek tıkla iptal" },
  { icon: Truck, label: "Ücretsiz Kargo", description: "Tüm abonelik teslimatlarında" },
];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Abonelik"
        title="Fındığın Hiç Bitmesin."
        description="Ürününü, sıklığını ve miktarını seç — teslimatı dilediğin zaman değiştir, ertele ya da durdur."
      />

      <div className="mx-auto mb-14 grid max-w-5xl gap-4 px-5 pt-12 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map(({ icon: Icon, label, description }, i) => (
          <Reveal key={label} delay={i * 90}>
          <div className="h-full rounded-2xl border border-brown/10 bg-white/60 p-5 text-center transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-brown-darker/10">
            <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green/10">
              <Icon size={18} className="text-green" aria-hidden="true" />
            </span>
            <p className="font-display text-sm font-bold text-brown-darker">{label}</p>
            <p className="mt-1 text-xs text-brown-dark/60">{description}</p>
          </div>
          </Reveal>
        ))}
      </div>

      <div className="mx-auto max-w-5xl px-5 pb-24">
        <SubscriptionFlow />
      </div>
    </>
  );
}
