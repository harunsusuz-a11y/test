import { getProductsServer } from "@/lib/data/products-server";
import { ProductCardDb } from "@/components/product/ProductCardDb";
import Link from "next/link";

export async function FeaturedProducts() {
  const products = await getProductsServer();
  const featured = products.filter((p) => p.is_featured).slice(0, 3);
  const display = featured.length > 0 ? featured : products.slice(0, 3);

  if (!display.length) return null;

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-widest text-brown/50 mb-2">Ürünler</p>
            <h2 className="font-display text-3xl md:text-4xl text-brown">Öne Çıkanlar</h2>
          </div>
          <Link
            href="/magaza"
            className="text-sm text-brown/60 hover:text-brown transition-colors underline-offset-4 hover:underline"
          >
            Tümünü gör →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {display.map((product) => (
            <ProductCardDb key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
