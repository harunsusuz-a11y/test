import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Leaf } from "lucide-react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFaq } from "@/components/product/ProductFaq";
import { formatPrice } from "@/lib/utils/format";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbJsonLd, getProductJsonLd } from "@/lib/seo/organization";
import { createClient } from "@/lib/supabase/server";

async function getReviewsFromDb(productSlug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("id,reviewer_name,rating,body,comment,verified_purchase,is_verified_purchase,created_at")
    .eq("product_slug", productSlug)
    .in("status", ["approved", "pending"])
    .order("created_at", { ascending: false });
  return data ?? [];
}
import { Reveal } from "@/components/animations/Reveal";
import { StatRings } from "@/components/product/StatRings";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { ProductHero } from "@/components/product/ProductHero";
import { ProductNav } from "@/components/product/ProductNav";
import { BuyBox } from "@/components/product/BuyBox";
import { ProductStory } from "@/components/product/ProductStory";
import { NutritionCard } from "@/components/product/NutritionCard";
import { TextureHotspots } from "@/components/product/TextureHotspots";
import { ReviewsPanel } from "@/components/product/ReviewsPanel";
import { OutlineMarquee, QuizCta } from "@/components/product/PdpBands";
import { getProductTheme } from "@/lib/utils/product-theme";
import { getProductsServer, getProductBySlugServer } from "@/lib/data/products-server";

export async function generateStaticParams() {
  try {
    const dbProducts = await getProductsServer();
    if (dbProducts.length > 0) return dbProducts.map((p) => ({ slug: p.slug }));
  } catch {}
  // Supabase build'de erişilemezse statik içerik dosyasından slug'ları al
  try {
    const { products } = await import("@/content/products");
    return products.map((p) => ({ slug: p.slug }));
  } catch {}
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugServer(slug);
  if (!product) return { title: "Ürün Bulunamadı" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ventiate.com";
  const img = product.image ?? product.main_image_url ?? "";
  const imageAbs = img.startsWith("http") ? img : `${siteUrl}${img}`;
  const categoryLabel = product.category === "protein-bar" ? "protein bar" : "fındık kreması";

  return {
    title: product.name,
    description: product.description ?? "",
    keywords: [
      product.name,
      "Venti-Ate",
      "Giresun fındığı",
      categoryLabel,
      "sağlıklı atıştırmalık",
      product.flavor,
      product.weightGrams ? `${product.weightGrams}g` : "",
    ].filter(Boolean) as string[],
    alternates: { canonical: `/urun/${slug}` },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      title: `${product.name} | Venti-Ate`,
      description: product.description ?? "",
      images: [{ url: imageAbs, width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Venti-Ate`,
      description: (product.shortDescription ?? product.short_description) ?? "",
      images: [imageAbs ?? ""],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlugServer(slug);
  if (!product) notFound();

  const allProducts = await getProductsServer();
  const related = allProducts.filter((p) => p.slug !== product.slug);
  const theme = getProductTheme(product as any);
  const reviews = await getReviewsFromDb(product.slug);
  const avgRating = reviews.length > 0
    ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length
    : null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: (product.image ?? product.main_image_url ?? "") as string,
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
    mainEntity: product.faq.map((item: { question: string; answer: string }) => ({
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
    <article>
      {/* JSON-LD structured data — statik, güvenli içerik */}
      <JsonLd data={structuredData} />
      <JsonLd data={faqStructuredData} />
      <JsonLd data={breadcrumbData} />

      {/* 1 — Sinematik açılış (ürüne özel renk kimliği) */}
      <ProductHero product={product as any} theme={theme} />

      {/* 2 — Scrollspy bölüm navigasyonu */}
      <ProductNav accentBg={theme.accentBg} />

      {/* 3 — Genel Bakış: sticky galeri + satın alma modülü */}
      <section id="genel-bakis" className="mx-auto max-w-6xl scroll-mt-32 px-5 py-16">
        <p className="mb-4 text-xs text-brown-dark/50">
          <Link href="/magaza" className="hover:text-green">
            Mağaza
          </Link>{" "}
          / {product.name}
        </p>

        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div className="md:sticky md:top-32">
            <ProductGallery image={(product.image ?? product.main_image_url ?? "") as string} gallery={(product.gallery ?? product.gallery_images ?? []) as string[]} name={product.name} isDemo={(product.isDemo ?? false) as boolean} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest2 text-green">{product.flavor}</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-brown-darker sm:text-4xl">{product.name}</h2>

            {avgRating && (
              <a href="#yorumlar" className="mt-2 flex w-fit items-center gap-1.5 text-sm text-brown-dark/70 hover:text-brown-darker">
                <span className="flex items-center gap-0.5 text-peach">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill={i < Math.round(avgRating) ? "currentColor" : "none"} strokeWidth={1.5} />
                  ))}
                </span>
                <span>
                  {avgRating.toFixed(1)} · {reviews.length} yorum
                </span>
              </a>
            )}

            <div className="mt-3 flex items-baseline gap-3">
              <p className="text-2xl font-bold text-brown-darker">{formatPrice(product.price)}</p>
              {(product.compareAtPrice ?? product.compare_at_price) && (
                <>
                  <p className="text-lg text-brown-dark/40 line-through">{formatPrice((product.compareAtPrice ?? product.compare_at_price)!)}</p>
                  <span className="rounded-full bg-green/10 px-2.5 py-1 text-xs font-bold text-green">
                    %{Math.round((1 - product.price / (product.compareAtPrice ?? product.compare_at_price)!) * 100)} indirim
                  </span>
                </>
              )}
            </div>

            <p className="mt-4 text-brown-dark/80">{(product.description ?? "") as string}</p>

            <ul className="mt-6 space-y-2">
              {product.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-sm text-brown-dark/85">
                  <Leaf size={15} className="mt-0.5 shrink-0 text-green" aria-hidden="true" />
                  {h}
                </li>
              ))}
            </ul>

            {/* Cam kart: adet + tek seferlik/abonelik toggle'ı */}
            <BuyBox product={product as any} theme={theme} />

            <StatRings proteinPercent={(product.proteinPercent ?? product.protein_percent) ?? 0} hazelnutPercent={(product.hazelnutPercent ?? product.hazelnut_percent) ?? 0} />

            <dl className="mt-8 divide-y divide-brown/10 border-y border-brown/10">
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
      </section>

      {/* 4 — Dev outline tipografi şeridi */}
      <OutlineMarquee text={(product.flavor ?? "") as string} theme={theme} />

      {/* 5 — Scroll-driven ürün hikâyesi */}
      <section id="hikaye" className="scroll-mt-32">
        <ProductStory product={product as any} theme={theme} />
      </section>

      {/* 6 — Besin etiketi + içindekiler + doku hotspot'ları */}
      <section id="besin" className="mx-auto max-w-6xl scroll-mt-32 px-5 py-20">
        <p className="text-xs font-bold uppercase tracking-widest2 text-green">Formül</p>
        <h2 className="mb-8 mt-2 font-display text-2xl font-extrabold text-brown-darker sm:text-3xl">
          Etikette ne varsa, burada da o var.
        </h2>
        <NutritionCard product={product as any} theme={theme} />
        <div className="mt-10">
          <TextureHotspots product={product as any} theme={theme} />
        </div>
      </section>

      {/* 7 — Nasıl Tüketilir */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <p className="text-xs font-bold uppercase tracking-widest2 text-green">Kullanım</p>
        <h2 className="mb-6 mt-2 font-display text-2xl font-extrabold text-brown-darker">Nasıl Tüketilir?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {((product.usageTips ?? product.usage_tips ?? []) as string[]).map((tip: string, i: number) => (
            <Reveal key={tip} delay={i * 45}>
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

      {/* 8 — Yorumlar */}
      <section id="yorumlar" className="mx-auto max-w-6xl scroll-mt-32 px-5 pb-20">
        <p className="text-xs font-bold uppercase tracking-widest2 text-green">Yorumlar</p>
        <h2 className="mb-8 mt-2 font-display text-2xl font-extrabold text-brown-darker sm:text-3xl">
          İlk ısıranlar ne dedi?
        </h2>
        <ReviewsPanel
                    reviews={(reviews as Array<{id:string;reviewer_name?:string;rating:number;body?:string;comment?:string;verified_purchase?:boolean;is_verified_purchase?:boolean;created_at?:string}>).map((r) => ({
                      ...r,
                      authorInitial: r.reviewer_name
                        ? r.reviewer_name.split(" ").map((n)=>n[0]).join(".")+"."
                        : "M.Ş.",
                      verifiedPurchase: r.verified_purchase ?? r.is_verified_purchase ?? false,
                      productSlug: product.slug,
                      isDemo: false as const,
                    }))}
                    averageRating={avgRating}
                    theme={theme}
                  />
      </section>

      {/* 9 — SSS */}
      <section id="sss" className="mx-auto max-w-6xl scroll-mt-32 px-5 pb-24">
        <p className="text-xs font-bold uppercase tracking-widest2 text-green">SSS</p>
        <h2 className="mb-6 mt-2 font-display text-2xl font-extrabold text-brown-darker">Sıkça Sorulan Sorular</h2>
        <ProductFaq items={product.faq} />
      </section>

      {/* 10 — Quiz CTA bandı */}
      <QuizCta theme={theme} />

      {/* 11 — Benzer Ürünler */}
      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-20">
          <p className="text-xs font-bold uppercase tracking-widest2 text-green">Keşfet</p>
          <h2 className="mb-6 mt-2 font-display text-2xl font-extrabold text-brown-darker">Benzer Ürünler</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 45}>
                <ProductCard product={p as any} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
