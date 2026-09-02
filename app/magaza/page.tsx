import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbJsonLd, getCollectionPageJsonLd } from "@/lib/seo/organization";
import { buildMetadata } from "@/lib/seo/metadata";
import { getProductsServer } from "@/lib/data/products-server";
import { ProductCardDb } from "@/components/product/ProductCardDb";

export const metadata: Metadata = buildMetadata({
  title: "Mağaza",
  description:
    "Protein bar ve fındık kreması — Venti-Ate'in tüm ürün ailesi. Giresun fındığından üretilen, gerçek içerikli, yüksek proteinli atıştırmalıklar.",
  path: "/magaza",
  keywords: [
    "Venti-Ate mağaza",
    "protein bar satın al",
    "fındık kreması satın al",
    "Giresun fındığı ürünleri",
    "sağlıklı atıştırmalık online",
    "fındık protein bar fiyat",
    "online fındık kreması",
  ],
});

const KATEGORILER = [
  { slug: "protein-bar", label: "Protein Bar" },
  { slug: "findik-kremasi", label: "Fındık Kreması" },
  { slug: "paketler", label: "Paketler" },
];

export default async function MagazaPage() {
  const dbProducts = await getProductsServer();

  const collectionLd = getCollectionPageJsonLd({
    name: "Venti-Ate Mağaza",
    description: "Tüm Venti-Ate ürünleri — protein bar ve fındık kreması.",
    url: "/magaza",
    products: dbProducts.map((p) => ({
      name: p.name,
      slug: p.slug,
      price: p.price,
      image: p.main_image_url ?? "",
    })),
  });
  const breadcrumb = getBreadcrumbJsonLd([
    { name: "Ana Sayfa", path: "/" },
    { name: "Mağaza", path: "/magaza" },
  ]);

  return (
    <>
      <JsonLd data={collectionLd} />
      <JsonLd data={breadcrumb} />
      <PageHeader eyebrow="Ürün Ailesi" title="Mağaza" description="Fındık başrolde." />

      {/* Kategori filtreleri */}
      <nav aria-label="Ürün kategorileri" className="mx-auto max-w-6xl px-5 pt-10">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/magaza"
            className="rounded-full border border-brown/20 bg-brown px-5 py-2 text-sm font-bold text-cream"
          >
            Tümü
          </Link>
          {KATEGORILER.map((cat) => (
            <Link
              key={cat.slug}
              href={`/magaza/kategori/${cat.slug}`}
              className="rounded-full border border-brown/20 px-5 py-2 text-sm font-medium text-brown-dark transition hover:border-brown hover:text-brown-darker"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Öne çıkan paket bant */}
      <div className="mx-auto mt-12 max-w-6xl px-5">
        <div className="flex items-center justify-between rounded-2xl border border-brown/10 bg-cream px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-peach">Deneme Paketi</p>
            <p className="mt-1 font-display text-lg font-bold text-brown-darker">
              Bar + Krema — ikisini birlikte dene, %10 indirimli.
            </p>
          </div>
          <Link
            href="/magaza/kategori/paketler"
            className="shrink-0 rounded-[10px] [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,0_100%)] bg-brown px-5 py-2.5 text-sm font-bold text-cream transition hover:bg-green"
          >
            Paketi Gör
          </Link>
        </div>
      </div>

      {/* Ürün grid */}
      <main className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dbProducts.map((product) => (
            <ProductCardDb key={product.slug} product={product} />
          ))}
        </div>
      </main>

      <div className="mx-auto max-w-6xl px-5 pb-20">
        <TrustBadges />
      </div>
    </>
  );
}
