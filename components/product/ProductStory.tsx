"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Product } from "@/content/products";
import type { ProductTheme } from "@/lib/utils/product-theme";

gsap.registerPlugin(ScrollTrigger);

/**
 * PDP'nin ortasında scroll ile ilerleyen 3 sahnelik ürün hikâyesi:
 * Kaynak → Formül → Doku. Ana sayfadaki ScrollStory ile aynı kanıtlanmış
 * scrub-reveal deseni kullanılır (pin YOK — scroll asla ele geçirilmez).
 * Metinler content/products.ts'teki gerçek ürün verisinden türetilir.
 */
type Scene = { eyebrow: string; title: string; text: string; image: string };

function buildScenes(product: Product): Scene[] {
  const isBar = product.category === "protein-bar";
  return [
    {
      eyebrow: "Kaynak",
      title: "Giresun'dan geliyor.",
      text: "Her parti, gerçek Giresun fındığıyla başlar — aroması ve yağ profiliyle dünyanın referans fındığı.",
      image: product.gallery[1] ?? product.image,
    },
    {
      eyebrow: "Formül",
      title: isBar ? `%${product.proteinPercent} protein, gerçek içerik.` : `%${product.hazelnutPercent} fındık, sade içerik.`,
      text: product.description,
      image: product.image,
    },
    {
      eyebrow: "Doku",
      title: isBar ? "Çıtır katman, gerçek parçalar." : "Pürüzsüz, sürülebilir kıvam.",
      text: product.highlights[0] ?? product.shortDescription,
      image: product.gallery[2] ?? product.gallery[1] ?? product.image,
    },
  ];
}

export function ProductStory({ product, theme }: { product: Product; theme: ProductTheme }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scenes = buildScenes(product);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>("[data-scene]").forEach((scene) => {
        const img = scene.querySelector("[data-scene-img]");
        const txt = scene.querySelector("[data-scene-txt]");
        gsap.fromTo(
          img,
          { y: 60, opacity: 0.35, scale: 1.06 },
          {
            y: -20,
            opacity: 1,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: scene, start: "top 85%", end: "center 45%", scrub: 0.6 },
          }
        );
        gsap.fromTo(
          txt,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: scene, start: "top 75%", end: "top 40%", scrub: 0.6 },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className={`${theme.heroBg} text-cream`}>
      <div className="mx-auto max-w-6xl space-y-28 px-5 py-28">
        {scenes.map((scene, i) => (
          <div
            key={scene.eyebrow}
            data-scene
            className={`grid items-center gap-10 md:grid-cols-2 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
          >
            <div data-scene-img className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
              <Image src={scene.image} alt="" fill sizes="(min-width: 768px) 45vw, 90vw" loading="lazy" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <div data-scene-txt>
              <p className={`text-xs font-bold uppercase tracking-widest2 ${theme.accentText}`}>{scene.eyebrow}</p>
              <h3 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{scene.title}</h3>
              <p className="mt-4 max-w-md leading-relaxed text-cream/70">{scene.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
