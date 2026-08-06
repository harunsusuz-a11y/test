import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { ProofTicker } from "@/components/home/ProofTicker";
import { SubscriptionToast } from "@/components/overlays/SubscriptionToast";
import { ScrollStory } from "@/components/home/ScrollStory";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { AromaNotes } from "@/components/home/AromaNotes";
import { BrandStory } from "@/components/home/BrandStory";
import { Community } from "@/components/home/Community";
import { Newsletter } from "@/components/home/Newsletter";

export const metadata: Metadata = {
  title: "Fındığın rafine hali",
  description:
    "Giresun fındığını merkeze alan, %25 proteinli protein bar ve %50 fındık kremasıyla sağlıklı atıştırmalık kategorisinde yeni bir standart. Gerçek içerik, güçlü lezzet.",
  keywords: [
    "Venti-Ate",
    "Giresun fındığı protein bar",
    "fındık kreması satın al",
    "sağlıklı atıştırmalık Türkiye",
    "yüksek proteinli bar",
    "doğal fındık kreması",
    "palm yağsız",
    "spor beslenmesi",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Venti-Ate — Fındığın rafine hali",
    description:
      "Giresun fındığını merkeze alan, %25 proteinli protein bar ve %50 fındık kremasıyla sağlıklı atıştırmalık kategorisinde yeni bir standart.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Venti-Ate ürünleri" }],
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProofTicker />
      <ScrollStory />
      <FeaturedProducts />
      <AromaNotes />
      <BrandStory />
      <Community />
      <Newsletter />
      <SubscriptionToast />
    </>
  );
}
