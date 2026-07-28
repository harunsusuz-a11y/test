"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { OrganicFrame } from "@/components/brand/OrganicFrame";
import { HazelnutMark } from "@/components/brand/HazelnutMark";
import { Scribble } from "@/components/brand/Scribble";

// Three.js/R3F sahnesi yalnızca istemcide, sadece Hero görünür olduğunda
// mount edilir — SSR'da hiç yüklenmez, ilk sayfa yükünü etkilemez.
const HazelnutScene = dynamic(
  () => import("@/components/three/HazelnutScene").then((m) => m.HazelnutScene),
  { ssr: false }
);

export function Hero() {
  const imgRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [scene3dReady, setScene3dReady] = useState(false);
  const [videoOk, setVideoOk] = useState(true);

  // Kontrollü mouse parallax (Motion — https://github.com/motiondivision/motion)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });
  const headlineX = useTransform(springX, [-0.5, 0.5], [-10, 10]);
  const headlineY = useTransform(springY, [-0.5, 0.5], [-6, 6]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const idle = requestAnimationFrame(() => setScene3dReady(!mq.matches));

    if (mq.matches || !imgRef.current) return () => cancelAnimationFrame(idle);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgRef.current,
        { scale: 1.12, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.4, ease: "power3.out" }
      );
    });
    return () => {
      ctx.revert();
      cancelAnimationFrame(idle);
    };
  }, []);

  function handlePointerMove(e: React.PointerEvent<HTMLElement>) {
    if (reducedMotion) return;
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      className="relative flex min-h-[92vh] items-end overflow-hidden bg-brown-darker text-cream"
    >
      <div ref={imgRef} className="absolute inset-0">
        <Image
          src="/images/hero-bars.jpg"
          alt="Venti-Ate fındıklı protein bar, kesitte gerçek fındık parçalarıyla"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        {/* Opsiyonel makro çekim loop videosu (premium gıda markası standardı):
            public/videos/hero-loop.webm eklendiğinde görselin üstünde oynar,
            dosya yoksa onError ile sessizce gizlenir ve statik görsel kalır.
            reduced-motion tercih edildiğinde hiç mount edilmez. */}
        {!reducedMotion && videoOk && (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            onError={() => setVideoOk(false)}
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          >
            {/* Kaynak bulunamadığında error olayı <source> üzerinde tetiklenir */}
            <source src="/videos/hero-loop.webm" type="video/webm" onError={() => setVideoOk(false)} />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brown-darker via-brown-darker/40 to-transparent" />
      </div>

      {/* İmza organik çerçeve: mükemmel dikdörtgen yerine düzensiz kenarlı,
          hafif döndürülmüş ikinci görsel katmanı. Grid'i kasıtlı olarak kırar —
          sağ kenardan taşar, metin sütununu hafifçe keser. */}
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

      {/* Three.js (react-three-fiber) — hafif dönen fındık sahnesi.
          Bilinçli olarak sadece sağ yarıda gösterilir (metin bloğu sol-altta),
          böylece hiçbir zaman başlık/CTA okunabilirliğini bozmaz. */}
      {scene3dReady && (
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-90 sm:block">
          <HazelnutScene />
        </div>
      )}

      {/* İnce film grain — SVG fractalNoise, ek asset indirmeden üretilir */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]">
        <filter id="hero-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-grain)" />
      </svg>

      <motion.div
        style={reducedMotion ? undefined : { x: headlineX, y: headlineY }}
        className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-32 sm:pb-20"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest2 text-peach"
        >
          <HazelnutMark size={15} />
          Giresun Fındığından · %25 Protein
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl"
        >
          Fındığın
          <br />
          <span className="relative inline-block">
            rafine
            <Scribble className="text-peach/80" />
          </span>{" "}
          hali.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-6 max-w-md text-lg text-cream/80"
        >
          Gerçek Giresun fındığı ve gerçek protein — sporcu çantasının yeni klasiği.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Link
            href="/magaza"
            className="rounded-full bg-peach px-7 py-3.5 text-sm font-bold text-brown-darker transition hover:scale-105 hover:bg-cream"
          >
            Ürünleri Keşfet
          </Link>
          <Link
            href="/hakkimizda"
            className="rounded-full border border-cream/30 px-7 py-3.5 text-sm font-bold text-cream transition hover:scale-105 hover:border-cream"
          >
            Hikayemizi Keşfet
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
