import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Gift, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { products, categories } from "@/content/products";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/animations/Reveal";
import { BUNDLE_NAME } from "@/content/discounts";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Mağaza" };

/**
 * Editorial mağaza: koyu açılış bandı, filtre pill'leri, öne çıkan geniş ürün
 * karesi + grid ve grid içinde Bar+Krema paket kartı (sepetteki otomatik
 * %10 paket indirimini yüzeye çıkarır).
 */
export default function Page() {
  const [featured, ...rest] = products;
  const bundlePair = {
    bar: products.find((p) => p.category === "protein-bar"),
    cream: products.find((p) => p.category === "findik-kremasi"),
  };
  const bundleTotal =
    bundlePair.bar && bundlePair.cream ? bundlePair.bar.price + bundlePair.cream.price : null;

  return (
    <>
      <PageHeader
        eyebrow="Mağaza"
        title="Sana uygun ateşi seç."
        description="Giresun fındığından, gerçek protein ve gerçek lezzetle — tüm ürün ailesi burada."
      />

      <div className="mx-auto max-w-6xl px-5 pb-24 pt-12">
        {/* Filtreler */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
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

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {/* Öne çıkan ürün — geniş editorial kare */}
          {featured && (
            <Reveal className="sm:col-span-2">
              <Link
                href={`/urun/${featured.slug}`}
                className="group relative flex h-full min-h-[22rem] flex-col justify-end overflow-hidden rounded-3xl bg-brown-darker text-cream"
              >
                <Image
                  src={featured.image}
                  alt={featured.name}
                  fill
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  className="object-cover opacity-75 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brown-darker via-brown-darker/30 to-transparent" />
                <div className="relative p-8">
                  <p className="text-xs font-bold uppercase tracking-widest2 text-peach">Öne Çıkan · {featured.flavor}</p>
                  <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">{featured.name}</h2>
                  <p className="mt-2 max-w-md text-sm text-cream/75">{featured.shortDescription}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-peach">
                    {formatPrice(featured.price)}
                    <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          )}

          {/* Paket kartı — sepetteki otomatik indirimi mağazada duyurur */}
          {bundlePair.bar && bundlePair.cream && bundleTotal && (
            <Reveal delay={100}>
              <div className="flex h-full flex-col justify-between rounded-3xl border-2 border-dashed border-green/40 bg-green/5 p-7">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest2 text-green">
                    <Gift size={14} aria-hidden="true" />
                    {BUNDLE_NAME}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-extrabold text-brown-darker">
                    İkisini al, ikili %10 indirimli olsun.
                  </h3>
                  <p className="mt-2 text-sm text-brown-dark/70">
                    {bundlePair.bar.name} + {bundlePair.cream.name} sepette buluşunca paket indirimi otomatik uygulanır — kod gerekmez.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="font-display text-lg font-bold text-brown-darker">
                    {formatPrice(bundleTotal)}
                    <span className="ml-2 text-sm font-semibold text-green">yerine avantajlı</span>
                  </span>
                  <Link
                    href={`/urun/${bundlePair.bar.slug}`}
                    className="rounded-full bg-green px-5 py-2.5 text-sm font-bold text-cream transition hover:bg-brown-darker"
                  >
                    Paketi Kur
                  </Link>
                </div>
              </div>
            </Reveal>
          )}

          {rest.map((product, i) => (
            <Reveal key={product.slug} delay={i * 90} className={i === 0 ? "sm:mt-8" : undefined}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>

        <TrustBadges className="mt-14 justify-center" />
      </div>
    </>
  );
}
