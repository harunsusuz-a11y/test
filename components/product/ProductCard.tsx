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
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white/60">
      <Link href={`/urun/${product.slug}`} className="relative block aspect-square overflow-hidden bg-brown/5">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {product.isDemo && (
          <span className="absolute left-3 top-3 rounded-full bg-brown-darker/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cream">
            Demo İçerik
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-widest2 text-green">{product.flavor}</p>
        <Link href={`/urun/${product.slug}`}>
          <h3 className="mt-1 font-display text-lg font-bold text-brown-darker">{product.name}</h3>
        </Link>
        <p className="mt-2 text-sm text-brown-dark/80">{product.shortDescription}</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-display text-lg font-bold text-brown-darker">{formatPrice(product.price)}</span>
          <button
            type="button"
            onClick={() => addItem(product)}
            className="flex items-center gap-1.5 rounded-full bg-brown px-4 py-2 text-xs font-bold text-cream transition hover:bg-green"
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
