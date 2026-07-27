import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { products } from "@/content/products";
import { ProductCard } from "@/components/product/ProductCard";

export const metadata: Metadata = { title: "Mağaza" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Mağaza"
        title="Tüm Ürünler"
        description="Giresun fındığından, gerçek protein ve gerçek lezzetle."
      />
      <div className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </>
  );
}
