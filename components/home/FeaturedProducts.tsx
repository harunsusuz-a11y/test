import { products } from "@/content/products";
import { ProductCard } from "@/components/product/ProductCard";

export function FeaturedProducts() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <div className="mb-12 max-w-xl">
        <p className="text-xs font-bold uppercase tracking-widest2 text-green">Ürün Ailesi</p>
        <h2 className="mt-3 font-display text-3xl font-extrabold text-brown-darker sm:text-4xl">
          Sana uygun ateşi seç.
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
