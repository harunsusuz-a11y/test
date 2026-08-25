"use server";

import { getProductsServer } from "@/lib/data/products-server";
import { ProductCardDb } from "@/components/product/ProductCardDb";
import { PageHeader } from "@/components/ui/PageHeader";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const KATEGORI_MAP: Record<string, { label: string; description: string }> = {
  "protein-bar": { label: "Protein Bar", description: "Gerçek Giresun fındığıyla hazırlanmış yüksek proteinli barlar." },
  "findik-kremasi": { label: "Fındık Kreması", description: "Palm yağı içermeyen, yüksek fındık oranlı kremalar." },
  "paketler": { label: "Paketler", description: "Bar ve krema kombinasyonlarıyla özel paketler." },
};

export async function generateStaticParams() {
  return Object.keys(KATEGORI_MAP).map((slug) => ({ kategori: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ kategori: string }> }): Promise<Metadata> {
  const { kategori } = await params;
  const cat = KATEGORI_MAP[kategori];
  if (!cat) return {};
  return {
    title: `${cat.label} | Venti-Ate`,
    description: cat.description,
  };
}

export default async function KategoriPage({ params }: { params: Promise<{ kategori: string }> }) {
  const { kategori } = await params;
  const cat = KATEGORI_MAP[kategori];
  if (!cat) notFound();

  const all = await getProductsServer();
  const products = all.filter((p) => {
    if (kategori === "protein-bar") return (p.attributes as { label: string; value: string }[])?.some((a) => a.label === "Protein Oranı") ?? p.slug.includes("bar");
    if (kategori === "findik-kremasi") return p.slug.includes("krema");
    if (kategori === "paketler") return p.slug.includes("paket") || p.slug.includes("deneme");
    return false;
  });

  return (
    <main>
      <PageHeader title={cat.label} description={cat.description} eyebrow="Kategori" />
      <section className="max-w-7xl mx-auto px-6 py-16">
        {products.length === 0 ? (
          <p className="text-brown/60 text-center py-20">Bu kategoride ürün bulunamadı.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => <ProductCardDb key={p.slug} product={p} />)}
          </div>
        )}
      </section>
    </main>
  );
}
