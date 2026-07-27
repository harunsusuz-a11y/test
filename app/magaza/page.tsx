import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { products, categories } from "@/content/products";
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
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/magaza/kategori/${c.slug}`}
              className="rounded-full border border-brown/20 px-5 py-2 text-sm font-semibold text-brown-dark transition hover:border-green hover:text-green"
            >
              {c.label}
            </Link>
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </>
  );
}
