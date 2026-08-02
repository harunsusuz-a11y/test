"use client";

import Image from "next/image";
import Link from "next/link";
import { OrganicFrame } from "@/components/brand/OrganicFrame";
import { HazelnutMark } from "@/components/brand/HazelnutMark";
import { Scribble } from "@/components/brand/Scribble";
import { MagneticButton } from "@/components/brand/MagneticButton";

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-end overflow-hidden bg-brown-darker text-cream">
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bars.jpg"
          alt="Venti-Ate fındıklı protein bar"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brown-darker via-brown-darker/40 to-transparent" />
      </div>

      <div className="pointer-events-none absolute -right-10 top-[8%] hidden w-[34%] max-w-md sm:block lg:right-4">
        <OrganicFrame variant={0} rotate={-4} className="relative aspect-[4/5] shadow-2xl shadow-black/40">
          <Image
            src="/images/hand-bars.jpg"
            alt=""
            fill
            sizes="34vw"
            className="object-cover"
          />
        </OrganicFrame>
      </div>

      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]">
        <filter id="hero-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-grain)" />
      </svg>

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-32 sm:pb-20">
        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest2 text-peach">
          <HazelnutMark className="h-4 w-4" />
          Giresun Fındığından
        </div>

        <h1 className="max-w-2xl font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
          <span className="inline-block">Fındığın</span>{" "}
          <span className="relative inline-block">
            rafine
            <Scribble className="text-peach/80" />
          </span>{" "}
          <span className="inline-block">hali.</span>
        </h1>

        <p className="mt-6 max-w-md text-lg text-cream/80">
          Giresun fındığının gücü, %25 protein ile buluştu. Gerçek malzeme, gerçek tat.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <MagneticButton>
            <Link href="/magaza" className="btn-signature bg-peach px-8 py-4 text-sm font-bold text-brown-darker transition hover:bg-cream active:scale-[0.98]">
              Ürünleri Keşfet
            </Link>
          </MagneticButton>
          <Link
            href="/hakkimizda"
            className="rounded-full border border-cream/30 px-8 py-4 text-sm font-bold text-cream transition hover:scale-105 hover:border-cream"
          >
            Hikayemiz
          </Link>
        </div>
      </div>
    </section>
  );
}
