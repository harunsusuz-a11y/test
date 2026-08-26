import type { Metadata } from "next";
import { HeroSlider } from "@/components/home/HeroSlider";
import { ProductSlider } from "@/components/home/ProductSlider";
import { BrandStorySection } from "@/components/home/BrandStorySection";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { InstagramGrid } from "@/components/home/InstagramGrid";
import { Newsletter } from "@/components/home/Newsletter";
import { ProofTicker } from "@/components/home/ProofTicker";
import { SubscriptionToast } from "@/components/overlays/SubscriptionToast";
import { getProductsServer } from "@/lib/data/products-server";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Fındığın Rafine Hali",
  description:
    "Giresun fındığını merkeze alan, %25 proteinli protein bar ve %50 fındık kremasıyla sağlıklı atıştırmalık kategorisinde yeni bir standart. Gerçek içerik, güçlü lezzet.",
  path: "/",
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
});

export default async function HomePage() {
  const products = await getProductsServer();

  return (
    <>
      <SubscriptionToast />
      <HeroSlider />
      <ProofTicker />
      <ProductSlider products={products} />
      <BrandStorySection />
      <ProcessSteps />
      <InstagramGrid />
      <Newsletter />
    </>
  );
}
