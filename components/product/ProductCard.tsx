"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Product } from "@/content/products";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils/format";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div
      data-cursor-text="İncele"
      className="group flex flex-col overflow-hidden rounded-3xl border border-brown/10 bg-white/70 shadow-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:border-brown/20 hover:shadow-xl hover:shadow-brown-darker/10"
    >
      <Link href={`/urun/${product.slug}`} className="relative block aspect-square overflow-hidden bg-brown/5">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brown-darker/15 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {product.isDemo && (
          <span className="absolute left-3 top-3 rounded-full bg-brown-darker/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cream backdrop-blur-sm">
            Demo İçerik
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest2 text-green">{product.flavor}</p>
        <Link href={`/urun/${product.slug}`}>
          <h3 className="mt-1.5 font-display text-xl font-semibold tracking-tight text-brown-darker">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2.5 text-sm leading-relaxed text-brown-dark/75">{product.shortDescription}</p>

        <div className="mt-5 flex items-center justify-between border-t border-brown/10 pt-5">
          <span className="font-display text-lg font-semibold text-brown-darker">
            {formatPrice(product.price)}
          </span>
          <button
            type="button"
            onClick={() => addItem(product)}
            className="flex items-center gap-1.5 rounded-full bg-brown-darker px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-cream transition-all duration-300 hover:bg-green hover:shadow-lg hover:shadow-green/20"
            aria-label={`${product.name} ürününü sepete ekle`}
          >
            <Plus size={14} aria-hidden="true" />
            Sepete Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
