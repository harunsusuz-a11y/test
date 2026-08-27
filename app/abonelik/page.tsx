import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubscriptionFlow } from "@/components/subscription/SubscriptionFlow";
import { Reveal } from "@/components/animations/Reveal";

export const metadata: Metadata = buildMetadata({
  title: "Abonelik",
  description: "Venti-Ate'i düzenli al, %10 indirim kazan. Haftalık, iki haftada bir veya aylık — taahhütsüz, istediğin an iptal et.",
  path: "/abonelik",
  keywords: ["Venti-Ate abonelik", "protein bar abonelik", "fındık kreması abonelik", "aylık protein bar", "abonelik iptal"],
});

const benefits = [
  { label: "%10 Abonelik İndirimi", description: "Her teslimatta otomatik uygulanır" },
  { label: "Ürünü Kolayca Değiştir", description: "İstediğin an ürün veya sıklık değiştir" },
  { label: "İstediğin Zaman Durdur", description: "Taahhüt yok, tek tıkla iptal" },
  { label: "Ücretsiz Kargo", description: "Tüm abonelik teslimatlarında" },
];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Abonelik"
        title="Fındığın Hiç Bitmesin."
        description="Ürününü, sıklığını ve miktarını seç — teslimatı dilediğin zaman değiştir, ertele ya da durdur."
      />

      <Reveal>
        <div className="mx-auto mb-14 grid max-w-5xl divide-y divide-brown/10 border-y border-brown/10 px-5 pt-12 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {benefits.map(({ label, description }) => (
            <div key={label} className="px-1 py-5 sm:px-6">
              <p className="font-display text-base font-bold text-brown-darker">{label}</p>
              <p className="mt-1 text-xs text-brown-dark/60">{description}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="mx-auto max-w-5xl px-5 pb-24">
        <SubscriptionFlow />
      </div>
    </>
  );
}
