"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/format";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import type { DbProduct } from "@/lib/data/products";

export function ProductCardDb({ product }: { product: DbProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);

  function handleAdd() {
    addItem({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.main_image_url ?? "/images/hero-bars.jpg",
    });
    openCartDrawer(product.slug);
  }

  return (
    <article className="group relative flex flex-col bg-cream rounded-2xl overflow-hidden border border-brown/8 hover:border-brown/20 transition-colors">
      <Link href={`/urun/${product.slug}`} className="block aspect-square overflow-hidden bg-cream-dark">
        {product.main_image_url ? (
          <Image
            src={product.main_image_url}
            alt={product.name}
            width={600}
            height={600}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brown/20 text-6xl">🌰</div>
        )}
      </Link>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <Link href={`/urun/${product.slug}`}>
          <h3 className="font-semibold text-brown leading-snug group-hover:text-green transition-colors">
            {product.name}
          </h3>
          {product.short_description && (
            <p className="text-sm text-brown/60 mt-1 line-clamp-2">{product.short_description}</p>
          )}
        </Link>
        <div className="mt-auto flex items-center justify-between gap-4">
          <div>
            <span className="font-bold text-brown text-lg">{formatPrice(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-sm text-brown/40 line-through ml-2">{formatPrice(product.compare_at_price)}</span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className="btn-signature bg-brown text-cream px-4 py-2 text-sm font-medium hover:bg-brown/90 transition-colors"
          >
            Sepete Ekle
          </button>
        </div>
      </div>
    </article>
  );
}
