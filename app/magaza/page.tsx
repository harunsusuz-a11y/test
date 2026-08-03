import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Gift, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { ProductCardDb } from "@/components/product/ProductCardDb";
import { Reveal } from "@/components/animations/Reveal";
import { BUNDLE_NAME } from "@/content/discounts";
import { formatPrice } from "@/lib/utils/format";
import { getProductsServer } from "@/lib/data/products-server";

export const metadata: Metadata = { title: "Mağaza" };

export default async function Page() {
  const products = await getProductsServer();
  const [featured, ...rest] = products;
  const bundleBar = products.find((p) => p.protein_percent && p.protein_percent > 0);
  const bundleCream = products.find((p) => p.hazelnut_percent && !p.protein_percent);
  const bundleTotal = bundleBar && bundleCream ? bundleBar.price + bundleCream.price : null;

  return (
    <>
      <PageHeader eyebrow="Ürün Ailesi" title="Mağaza" />
      <div className="mx-auto max-w-6xl px-5 py-16">

        {/* Öne Çıkan Ürün */}
        {featured && (
          <Reveal>
            <Link href={`/urun/${featured.slug}`}
              className="group mb-16 grid overflow-hidden rounded-3xl border border-brown/10 bg-white/70 md:grid-cols-2">
              <div className="relative aspect-square overflow-hidden bg-brown/5">
                {featured.main_image_url && (
                  <Image src={featured.main_image_url} alt={featured.name} fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(min-width:768px) 50vw, 100vw" priority />
                )}
                {featured.compare_at_price && (
                  <span className="absolute right-4 top-4 rounded-full bg-green px-3 py-1 text-xs font-bold text-cream">
                    %{Math.round((1 - featured.price / featured.compare_at_price) * 100)} İndirim
                  </span>
                )}
              </div>
              <div className="flex flex-col justify-center p-8 md:p-12">
                <p className="text-xs font-bold uppercase tracking-widest text-green">{featured.flavor ?? "Öne Çıkan"}</p>
                <h2 className="mt-2 font-display text-3xl font-extrabold text-brown-darker">{featured.name}</h2>
                {featured.short_description && (
                  <p className="mt-3 text-brown-dark/70">{featured.short_description}</p>
                )}
                <div className="mt-6 flex items-baseline gap-3">
                  <span className="font-display text-2xl font-bold text-brown-darker">{formatPrice(featured.price)}</span>
                  {featured.compare_at_price && (
                    <span className="text-sm text-brown-dark/40 line-through">{formatPrice(featured.compare_at_price)}</span>
                  )}
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-green transition group-hover:gap-3">
                  İncele <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </Reveal>
        )}

        {/* Ürün Grid */}
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((product, i) => (
            <Reveal key={product.id} delay={i * 45}>
              <ProductCardDb product={product} />
            </Reveal>
          ))}

          {/* Paket Kartı */}
          {bundleTotal && bundleBar && bundleCream && (
            <Reveal delay={rest.length * 45}>
              <div className="flex flex-col overflow-hidden rounded-3xl border border-dashed border-green/40 bg-green/5 p-6">
                <div className="flex items-center gap-2">
                  <Gift size={18} className="text-green" />
                  <p className="text-xs font-bold uppercase tracking-widest text-green">{BUNDLE_NAME}</p>
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold text-brown-darker">
                  Bar + Krema Paketi
                </h3>
                <p className="mt-2 text-sm text-brown-dark/70">
                  İkisini birlikte al, sepette otomatik %10 indirim kazان.
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-lg font-bold text-brown-darker">
                    {formatPrice(bundleTotal * 0.9)}
                  </span>
                  <span className="text-sm text-brown-dark/40 line-through">{formatPrice(bundleTotal)}</span>
                </div>
                <div className="mt-6 flex gap-3">
                  <Link href={`/urun/${bundleBar.slug}`}
                    className="flex-1 rounded-full border border-green/30 py-2.5 text-center text-xs font-bold text-green transition hover:bg-green hover:text-cream">
                    Bar
                  </Link>
                  <Link href={`/urun/${bundleCream.slug}`}
                    className="flex-1 rounded-full border border-green/30 py-2.5 text-center text-xs font-bold text-green transition hover:bg-green hover:text-cream">
                    Krema
                  </Link>
                </div>
              </div>
            </Reveal>
          )}
        </div>

        <TrustBadges className="mt-20" />
      </div>
    </>
  );
}
