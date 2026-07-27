import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { products } from "@/content/products";
import { ProductCard } from "@/components/product/ProductCard";

export const metadata: Metadata = { title: "Arama Sonuçları" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLocaleLowerCase("tr-TR");

  const results = query
    ? products.filter((p) =>
        [p.name, p.flavor, p.shortDescription].some((f) => f.toLocaleLowerCase("tr-TR").includes(query))
      )
    : products;

  return (
    <>
      <PageHeader
        eyebrow="Arama"
        title={query ? `“${query}” için sonuçlar` : "Tüm Ürünler"}
        description={`${results.length} ürün bulundu.`}
      />
      <div className="mx-auto max-w-6xl px-5 pb-20">
        {results.length === 0 ? (
          <p className="text-center text-brown-dark/70">
            Aradığın kriterlere uygun ürün bulunamadı. Farklı bir kelime dener misin?
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
