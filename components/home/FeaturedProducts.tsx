"use client";

import { motion } from "motion/react";
import { products } from "@/content/products";
import { ProductCard } from "@/components/product/ProductCard";

export function FeaturedProducts() {
  return (
    <section id="urun-ailesi" className="mx-auto max-w-6xl px-5 py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mb-14 max-w-xl"
      >
        <p className="text-xs font-bold uppercase tracking-widest2 text-green">Ürün Ailesi</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight text-brown-darker sm:text-4xl">
          Sana uygun ateşi seç.
        </h2>
      </motion.div>

      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, i) => (
          <motion.div
            key={product.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.045, ease: [0.16, 1, 0.3, 1] }}
            // İkinci üründe hafif düşey ofset — mükemmel hizalı ızgarayı kasıtlı kırar
            className={i === 1 ? "lg:mt-10" : undefined}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
