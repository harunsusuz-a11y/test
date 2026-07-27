import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { products, getProductBySlug } from "@/content/products";
import { AddToCartPanel } from "@/components/product/AddToCartPanel";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductReviews } from "@/components/product/ProductReviews";
import { formatPrice } from "@/lib/utils/format";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbJsonLd } from "@/lib/seo/organization";
import { getReviewsForProduct, getAverageRating } from "@/content/reviews";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Ürün Bulunamadı" };
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: { title: product.name, description: product.shortDescription, images: [product.image] },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = products.filter((p) => p.slug !== product.slug);
  const reviews = getReviewsForProduct(product.slug);
  const avgRating = getAverageRating(product.slug);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: product.image,
    offers: {
      "@type": "Offer",
      priceCurrency: "TRY",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
    // Yorumlar demo/örnek içerik olduğu için gerçek bir aggregateRating uydurulmaz;
    // yalnızca gerçek demo veri seti varsa (isDemo işaretli) hesaplanan değer eklenir.
    ...(avgRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: reviews.length,
          },
        }
      : {}),
  };

  const breadcrumbData = getBreadcrumbJsonLd([
    { name: "Ana Sayfa", path: "/" },
    { name: "Mağaza", path: "/magaza" },
    { name: product.name, path: `/urun/${product.slug}` },
  ]);

  return (
    <article className="mx-auto max-w-6xl px-5 py-12">
      {/* JSON-LD structured data — statik, güvenli içerik */}
      <JsonLd data={structuredData} />
      <JsonLd data={breadcrumbData} />

      <p className="mb-2 text-xs text-brown-dark/50">
        <a href="/magaza" className="hover:text-green">
          Mağaza
        </a>{" "}
        / {product.name}
      </p>

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-brown/5">
            <Image src={product.image} alt={product.name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" priority />
            {product.isDemo && (
              <span className="absolute left-4 top-4 rounded-full bg-brown-darker/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cream">
                Demo İçerik
              </span>
            )}
          </div>
          {product.gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              {product.gallery.map((src) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-xl bg-brown/5">
                  <Image src={src} alt="" fill sizes="200px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest2 text-green">{product.flavor}</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-brown-darker sm:text-4xl">{product.name}</h1>
          <p className="mt-3 text-2xl font-bold text-brown-darker">{formatPrice(product.price)}</p>
          <p className="mt-4 text-brown-dark/80">{product.description}</p>

          <AddToCartPanel product={product} />

          <dl className="mt-10 divide-y divide-brown/10 border-y border-brown/10">
            {product.attributes.map((attr) => (
              <div key={attr.label} className="flex items-center justify-between py-3 text-sm">
                <dt className="text-brown-dark/60">{attr.label}</dt>
                <dd className="font-semibold text-brown-darker">{attr.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <ProductReviews reviews={reviews} averageRating={avgRating} />

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-display text-2xl font-extrabold text-brown-darker">Benzer Ürünler</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
