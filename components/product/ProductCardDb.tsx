"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { formatPrice } from "@/lib/utils/format";
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
      
    } as Parameters<typeof addItem>[0]);
    openCartDrawer(product.slug);
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-brown/10 bg-white/70 shadow-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:border-brown/20 hover:shadow-xl hover:shadow-brown-darker/10">
      <Link href={`/urun/${product.slug}`} className="relative block aspect-square overflow-hidden bg-brown/5">
        {product.main_image_url && (
          <Image src={product.main_image_url} alt={product.name} fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" />
        )}
        {product.is_bestseller && (
          <span className="absolute left-3 top-3 rounded-full bg-brown-darker/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cream backdrop-blur-sm">
            Çok Satan
          </span>
        )}
        {product.compare_at_price && (
          <span className="absolute right-3 top-3 rounded-full bg-green px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cream">
            %{Math.round((1 - product.price / product.compare_at_price) * 100)} İndirim
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        {product.flavor && (
          <p className="text-[11px] font-semibold uppercase tracking-widest text-green">{product.flavor}</p>
        )}
        <Link href={`/urun/${product.slug}`}>
          <h3 className="mt-1.5 font-display text-xl font-semibold tracking-tight text-brown-darker">{product.name}</h3>
        </Link>
        {product.short_description && (
          <p className="mt-2.5 text-sm leading-relaxed text-brown-dark/75">{product.short_description}</p>
        )}
        <div className="mt-5 flex items-center justify-between border-t border-brown/10 pt-5">
          <span className="flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold text-brown-darker">{formatPrice(product.price)}</span>
            {product.compare_at_price && (
              <span className="text-xs text-brown-dark/40 line-through">{formatPrice(product.compare_at_price)}</span>
            )}
          </span>
          <button type="button" onClick={handleAdd}
            aria-label={`${product.name} ürününü sepete ekle`}
            className="flex items-center gap-1.5 rounded-full bg-brown-darker px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-cream transition-all duration-300 hover:bg-green hover:shadow-lg hover:shadow-green/20">
            <Plus size={14} aria-hidden="true" /> Sepete Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
