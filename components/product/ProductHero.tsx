"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { Product } from "@/content/products";
import type { ProductTheme } from "@/lib/utils/product-theme";
import { formatPrice } from "@/lib/utils/format";
import { OrganicFrame } from "@/components/brand/OrganicFrame";
import { HazelnutMark } from "@/components/brand/HazelnutMark";
import { Scribble } from "@/components/brand/Scribble";

/**
 * PDP'nin sinematik açılışı: ürüne özel koyu zemin, dev Fraunces ürün adı,
 * ortada büyük ürün görseli. Ana sayfadaki hero diliyle aynı ailedendir.
 * LCP notu: görsel priority ile yüklenir; giriş animasyonları yalnızca
 * transform/opacity üzerinde çalışır ve kısa tutulur.
 */
export function ProductHero({ product, theme }: { product: Product; theme: ProductTheme }) {
  return (
    <section className={`relative overflow-hidden ${theme.heroBg} text-cream`}>
      {/* Arka planda dev, içi boş ürün adı — ürünün "imzası" */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-10 select-none overflow-hidden text-center font-display text-[22vw] font-bold leading-none opacity-[0.12] sm:text-[16vw]"
        style={{ WebkitTextStroke: `1.5px ${theme.strokeColor}`, color: "transparent" }}
      >
        {product.flavor}
      </div>

      {/* İnce film grain — ana sayfa Hero ile aynı doku */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]">
        <filter id="pdp-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#pdp-grain)" />
      </svg>

      <div className="relative mx-auto grid min-h-[86vh] max-w-6xl items-center gap-10 px-5 pb-24 pt-28 md:grid-cols-[1.1fr_1fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest2 ${theme.accentText}`}
          >
            <HazelnutMark size={15} />
            {product.flavor} · {product.category === "protein-bar" ? "Protein Bar" : "Fındık Kreması"}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 max-w-xl font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-6xl"
          >
            <span className="relative inline-block">
              {product.name.split(" ")[0]}
              <Scribble className={theme.accentText} />
            </span>{" "}
            {product.name.split(" ").slice(1).join(" ")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-5 max-w-md text-lg text-cream/75"
          >
            {product.shortDescription}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center gap-5"
          >
            <span className="font-display text-2xl font-bold">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-base text-cream/40 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
            <Link
              href="#genel-bakis"
              className={`btn-signature px-8 py-4 text-sm font-bold text-brown-darker transition hover:brightness-95 active:scale-[0.98] ${theme.accentBg}`}
            >
              Satın Al
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative md:-mt-6 md:translate-x-4"
        >
          <OrganicFrame variant={1} rotate={3} className="relative aspect-[4/5] shadow-2xl shadow-black/40">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          </OrganicFrame>
          {product.isDemo && (
            <span className="absolute left-4 top-4 rounded-full bg-black/50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-cream backdrop-blur-sm">
              Demo İçerik
            </span>
          )}
        </motion.div>
      </div>

      <Link
        href="#genel-bakis"
        aria-label="Detaylara in"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-cream/50 transition hover:text-cream motion-safe:animate-bounce"
      >
        <ChevronDown size={22} aria-hidden="true" />
      </Link>
    </section>
  );
}
