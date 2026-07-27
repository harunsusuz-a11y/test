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
