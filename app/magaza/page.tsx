import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { TrustBadges } from "@/components/ui/TrustBadges";
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
      <TrustBadges className="mx-auto mb-10 max-w-3xl justify-center px-5" />
      <div className="mx-auto max-w-6xl px-5 pb-20">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-brown-darker bg-brown-darker px-5 py-2 text-sm font-semibold text-cream">
              Tüm Ürünler
            </span>
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
          <p className="text-sm text-brown-dark/50">{products.length} ürün</p>
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
