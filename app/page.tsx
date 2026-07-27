import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { ScrollStory } from "@/components/home/ScrollStory";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BrandStory } from "@/components/home/BrandStory";
import { Newsletter } from "@/components/home/Newsletter";

export const metadata: Metadata = {
  title: "Fındığın rafine hali",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <ScrollStory />
      <FeaturedProducts />
      <BrandStory />
      <Newsletter />
    </>
  );
}
