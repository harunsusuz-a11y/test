"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Scene = { image: string; alt: string; eyebrow: string; caption: string };

const scenes: Scene[] = [
  {
    image: "/images/hero-bars.jpg",
    alt: "Kesilmiş Venti-Ate protein barları, içindeki gerçek fındık parçaları görünür şekilde",
    eyebrow: "01 · Kaynak",
    caption: "Gerçek Giresun fındığıyla başlar.",
  },
  {
    image: "/images/cream-pour.jpg",
    alt: "Venti-Ate fındık kreması kavanozdan dökülürken",
    eyebrow: "02 · Dönüşüm",
    caption: "%50 fındık oranıyla krema olur.",
  },
  {
    image: "/images/hand-bars.jpg",
    alt: "Elde tutulan üç Venti-Ate protein barı",
    eyebrow: "03 · Kullanım",
    caption: "Çantana, antrenmana, güne katılır.",
  },
];

export function ScrollStory() {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return; // Statik: CSS'teki nihai durum (opacity/scale tam) zaten okunabilir.

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      sectionRefs.current.forEach((el) => {
        if (!el) return;
        const image = el.querySelector<HTMLElement>("[data-scene-image]");
        const caption = el.querySelector<HTMLElement>("[data-scene-caption]");

        gsap.fromTo(
          image,
          { scale: 1.18 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "top top", scrub: true },
          }
        );
        gsap.fromTo(
          caption,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 75%", end: "top 30%", scrub: true },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section aria-label="Venti-Ate'in hikayesi: kaynaktan kullanıma">
      {scenes.map((scene, i) => (
        <div
          key={scene.image}
          ref={(el) => {
            sectionRefs.current[i] = el;
          }}
          className="relative h-[90vh] overflow-hidden bg-brown-darker"
        >
          <div data-scene-image className="absolute inset-0">
            <Image
              src={scene.image}
              alt={scene.alt}
              fill
              sizes="100vw"
              className="object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-brown-darker/45" />
          </div>

          <div
            data-scene-caption
            className="relative flex h-full max-w-6xl flex-col justify-end px-5 pb-16 mx-auto sm:pb-24"
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-widest2 text-peach">{scene.eyebrow}</p>
            <p className="max-w-lg font-display text-3xl font-extrabold leading-tight text-cream sm:text-5xl">
              {scene.caption}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
