import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Sprout, Leaf } from "lucide-react";
import { products, getProductBySlug } from "@/content/products";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartPanel } from "@/components/product/AddToCartPanel";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductFaq } from "@/components/product/ProductFaq";
import { formatPrice } from "@/lib/utils/format";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbJsonLd } from "@/lib/seo/organization";
import { getReviewsForProduct, getAverageRating } from "@/content/reviews";
import { Reveal } from "@/components/animations/Reveal";
import { StatRings } from "@/components/product/StatRings";
import { TrustBadges } from "@/components/ui/TrustBadges";

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
    // SSS için de FAQPage structured data — gerçek, sitede görünen sorulardan üretiliyor.
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: product.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
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
      <JsonLd data={faqStructuredData} />
      <JsonLd data={breadcrumbData} />

      <p className="mb-2 text-xs text-brown-dark/50">
        <Link href="/magaza" className="hover:text-green">
          Mağaza
        </Link>{" "}
        / {product.name}
      </p>

      <div className="grid gap-10 md:grid-cols-2 md:items-start">
        {/* Desktop'ta galeri sabitlenir; sağ kolon içerik boyunca kayar (premium PDP deseni) */}
        <div className="md:sticky md:top-24">
          <ProductGallery image={product.image} gallery={product.gallery} name={product.name} isDemo={product.isDemo} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest2 text-green">{product.flavor}</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-brown-darker sm:text-4xl">{product.name}</h1>

          {avgRating && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-brown-dark/70">
              <span className="flex items-center gap-0.5 text-peach">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.round(avgRating) ? "currentColor" : "none"} strokeWidth={1.5} />
                ))}
              </span>
              <span>
                {avgRating.toFixed(1)} · {reviews.length} yorum <span className="text-brown-dark/40">(demo veri)</span>
              </span>
            </div>
          )}

          <div className="mt-3 flex items-baseline gap-3">
            <p className="text-2xl font-bold text-brown-darker">{formatPrice(product.price)}</p>
            {product.compareAtPrice && (
              <>
                <p className="text-lg text-brown-dark/40 line-through">{formatPrice(product.compareAtPrice)}</p>
                <span className="rounded-full bg-green/10 px-2.5 py-1 text-xs font-bold text-green">
                  %{Math.round((1 - product.price / product.compareAtPrice) * 100)} indirim
                </span>
              </>
            )}
          </div>

          <p className="mt-4 text-brown-dark/80">{product.description}</p>

          {/* İmza efekti: görünür olunca dolan protein/fındık oranı halkaları */}
          <StatRings proteinPercent={product.proteinPercent} hazelnutPercent={product.hazelnutPercent} />

          {/* Neden Venti-Ate — dönüşümü destekleyen kısa vurgular */}
          <ul className="mt-6 space-y-2">
            {product.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-sm text-brown-dark/85">
                <Leaf size={15} className="mt-0.5 shrink-0 text-green" aria-hidden="true" />
                {h}
              </li>
            ))}
          </ul>

          <AddToCartPanel product={product} />

          <dl className="mt-10 divide-y divide-brown/10 border-y border-brown/10">
            {product.attributes.map((attr) => (
              <div key={attr.label} className="flex items-center justify-between py-3 text-sm">
                <dt className="text-brown-dark/60">{attr.label}</dt>
                <dd className="font-semibold text-brown-darker">{attr.value}</dd>
              </div>
            ))}
          </dl>

          <TrustBadges className="mt-6" />
        </div>
      </div>

      {/* İçindekiler + Besin Değerleri */}
      <section className="mt-20 grid gap-10 md:grid-cols-2">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-widest2 text-green">Formül</p>
          <h2 className="mb-4 mt-2 font-display text-2xl font-extrabold text-brown-darker">İçindekiler</h2>
          <ul className="space-y-1.5 text-sm text-brown-dark/80">
            {product.ingredients.map((ing) => (
              <li key={ing} className="flex items-center gap-2">
                <Sprout size={14} className="text-green" aria-hidden="true" />
                {ing}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-brown-dark/45">
            İçindekiler listesi ve alerjen bilgisi ürün etiketi resmi olarak onaylanınca güncellenecektir.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <p className="text-xs font-bold uppercase tracking-widest2 text-green">Besin</p>
          <h2 className="mb-4 mt-2 font-display text-2xl font-extrabold text-brown-darker">
            Besin Değerleri <span className="text-sm font-normal text-brown-dark/50">(100g için)</span>
          </h2>
          <dl className="divide-y divide-brown/10 rounded-2xl border border-brown/10">
            {product.nutritionPer100g.map((row) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-brown/[0.03]">
                <dt className="text-brown-dark/60">{row.label}</dt>
                <dd className="font-semibold text-brown-darker">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-brown-dark/45">
            Bu değerler ön formülasyona dayanır; kesin besin değerleri resmi ürün etiketiyle netleşecektir.
          </p>
        </Reveal>
      </section>

      {/* Nasıl Tüketilir */}
      <section className="mt-20">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-widest2 text-green">Kullanım</p>
          <h2 className="mb-6 mt-2 font-display text-2xl font-extrabold text-brown-darker">Nasıl Tüketilir?</h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {product.usageTips.map((tip, i) => (
            <Reveal key={tip} delay={i * 90}>
              <div className="group h-full rounded-2xl border border-brown/10 bg-brown/[0.03] p-6 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-brown/20 hover:bg-white/70 hover:shadow-lg hover:shadow-brown-darker/10">
                <span className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-green">
                  {String(i + 1).padStart(2, "0")}
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-peach opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </span>
                <p className="text-sm text-brown-dark/80">{tip}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SSS */}
      <section className="mt-20">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-widest2 text-green">SSS</p>
          <h2 className="mb-6 mt-2 font-display text-2xl font-extrabold text-brown-darker">Sıkça Sorulan Sorular</h2>
          <ProductFaq items={product.faq} />
        </Reveal>
      </section>

      <Reveal>
        <ProductReviews reviews={reviews} averageRating={avgRating} />
      </Reveal>

      {related.length > 0 && (
        <section className="mt-24">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-widest2 text-green">Keşfet</p>
            <h2 className="mb-6 mt-2 font-display text-2xl font-extrabold text-brown-darker">Benzer Ürünler</h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 90}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
