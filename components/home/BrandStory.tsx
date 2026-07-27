"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { brand } from "@/content/brand";

export function BrandStory() {
  return (
    <section className="bg-brown-darker text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-28 md:grid-cols-2 md:items-center md:gap-16">
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-[4/5] overflow-hidden rounded-3xl"
        >
          <Image
            src="/images/lifestyle-waffle.jpg"
            alt="Venti-Ate fındık kreması gerçek bir kahvaltı sofrasında kullanılırken"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-cream/10" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs font-bold uppercase tracking-widest2 text-peach">Marka Hikayesi</p>
          <h2 className="mt-3 font-display text-3xl font-semibold italic leading-tight tracking-tight sm:text-4xl">
            {brand.tagline}
          </h2>
          <p className="mt-6 max-w-lg leading-relaxed text-cream/80">{brand.shortStory}</p>

          <ul className="mt-9 grid grid-cols-2 gap-x-5 gap-y-6">
            {brand.values.map((v) => (
              <li key={v.title} className="border-l border-peach/30 pl-4">
                <p className="font-display text-sm font-semibold text-peach">{v.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-cream/65">{v.description}</p>
              </li>
            ))}
          </ul>

          <Link
            href="/hakkimizda"
            className="mt-10 inline-block rounded-full border border-cream/30 px-7 py-3.5 text-sm font-bold tracking-wide transition-all duration-300 hover:border-peach hover:bg-peach/10 hover:text-peach"
          >
            Hikayenin Tamamını Oku
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
