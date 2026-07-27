import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { ProductCard } from "@/components/product/ProductCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbJsonLd } from "@/lib/seo/organization";
import { categories, getCategoryBySlug, getProductsByCategory } from "@/content/products";

export function generateStaticParams() {
  return categories.map((c) => ({ kategori: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kategori: string }>;
}): Promise<Metadata> {
  const { kategori } = await params;
  const category = getCategoryBySlug(kategori);
  if (!category) return { title: "Kategori Bulunamadı" };
  return { title: category.label, description: category.description };
}

export default async function Page({ params }: { params: Promise<{ kategori: string }> }) {
  const { kategori } = await params;
  const category = getCategoryBySlug(kategori);
  if (!category) notFound();

  const categoryProducts = getProductsByCategory(category.slug);

  const breadcrumbData = getBreadcrumbJsonLd([
    { name: "Ana Sayfa", path: "/" },
    { name: "Mağaza", path: "/magaza" },
    { name: category.label, path: `/magaza/kategori/${category.slug}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbData} />
      <PageHeader eyebrow="Kategori" title={category.label} description={category.description} />
      <TrustBadges className="mx-auto mb-10 max-w-3xl justify-center px-5" />
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/magaza"
              className="rounded-full border border-brown/20 px-5 py-2 text-sm font-semibold text-brown-dark transition hover:border-green hover:text-green"
            >
              Tüm Ürünler
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/magaza/kategori/${c.slug}`}
                aria-current={c.slug === category.slug ? "page" : undefined}
                className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                  c.slug === category.slug
                    ? "border-brown-darker bg-brown-darker text-cream"
                    : "border-brown/20 text-brown-dark hover:border-green hover:text-green"
                }`}
              >
                {c.label}
              </Link>
            ))}
          </div>
          <p className="text-sm text-brown-dark/50">{categoryProducts.length} ürün</p>
        </div>

        {categoryProducts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categoryProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-brown-dark/60">Bu kategoride henüz ürün bulunmuyor.</p>
        )}
      </div>
    </>
  );
}
