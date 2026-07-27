"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function Hero() {
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches || !imgRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgRef.current,
        { scale: 1.12, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.4, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative flex min-h-[92vh] items-end overflow-hidden bg-brown-darker text-cream">
      <div ref={imgRef} className="absolute inset-0">
        <Image
          src="/images/hero-bars.jpg"
          alt="Venti-Ate fındıklı protein bar, kesitte gerçek fındık parçalarıyla"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brown-darker via-brown-darker/40 to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-32 sm:pb-20">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest2 text-peach">
          Giresun Fındığından · %25 Protein
        </p>
        <h1 className="max-w-2xl font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
          Fındığın
          <br />
          rafine hali.
        </h1>
        <p className="mt-6 max-w-md text-lg text-cream/80">
          Gerçek Giresun fındığı ve gerçek protein — sporcu çantasının yeni klasiği.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/magaza"
            className="rounded-full bg-peach px-7 py-3.5 text-sm font-bold text-brown-darker transition hover:bg-cream"
          >
            Ürünleri Keşfet
          </Link>
          <Link
            href="/hakkimizda"
            className="rounded-full border border-cream/30 px-7 py-3.5 text-sm font-bold text-cream transition hover:border-cream"
          >
            Hikayemizi Keşfet
          </Link>
        </div>
      </div>
    </section>
  );
}
