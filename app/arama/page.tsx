import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { getProductsServer } from "@/lib/data/products-server";
import { ProductCardDb } from "@/components/product/ProductCardDb";

export const metadata: Metadata = {
  title: "Arama",
  description: "Venti-Ate ürünlerinde ara — protein bar, fındık kreması ve daha fazlası.",
  robots: { index: false, follow: true },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLocaleLowerCase("tr-TR");

  const allProducts = await getProductsServer();
  const results = query
    ? allProducts.filter((p: any) =>
        [p.name, p?.flavor, p.shortDescription].some((f) => f.toLocaleLowerCase("tr-TR").includes(query))
      )
    : allProducts;

  return (
    <>
      <PageHeader
        eyebrow="Arama"
        title={query ? `“${query}” için sonuçlar` : "Tüm Ürünler"}
        description={`${results.length} ürün bulundu.`}
      />
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-12">
        {results.length === 0 ? (
          <p className="text-center text-brown-dark/70">
            Aradığın kriterlere uygun ürün bulunamadı. Farklı bir kelime dener misin?
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((product) => (
              <ProductCardDb key={product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
