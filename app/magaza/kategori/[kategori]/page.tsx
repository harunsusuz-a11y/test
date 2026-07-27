import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
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
      <div className="mx-auto max-w-6xl px-5 pb-20">
        <p className="mb-6 text-xs text-brown-dark/50">
          <Link href="/magaza" className="hover:text-green">
            Tüm Ürünler
          </Link>{" "}
          / {category.label}
        </p>
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
