"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Ana scroll hikâyesi — GSAP ScrollTrigger (pin:true + scrub:true) ile
 * tek bir "pinned" sahneye bağlı 6 perdelik dönüşüm anlatısı:
 * Kaynak → Kavurma → Kırılma → Krema → Protein Bar → Kullanım.
 *
 * Notlar:
 * - Gerçek shader/liquid geçişleri (SVG displacement, WebGL noise) burada
 *   YOK — bunun yerine spesifikasyonun kendi belirttiği "düşük performans
 *   fallback"ı olan crossfade + hafif zoom kullanılıyor. Bu bilinçli bir
 *   kapsam kararı: shader tabanlı sıvı geçiş, görsel doğrulaması bu ortamda
 *   yapılamayan yüksek riskli bir iş; crossfade her tarayıcıda güvenilir
 *   çalışır.
 * - Metin güncellemeleri React state ile değil, doğrudan ref/DOM üzerinden
 *   yapılıyor (spec'in "scroll sırasında React state güncelleme" uyarısına
 *   uygun).
 * - Mobilde (768px altı) ve prefers-reduced-motion açıkken pin devre dışı;
 *   sade, dikey akan statik bir versiyon gösterilir.
 */

type Scene = { image: string; alt: string; eyebrow: string; caption: string };

const scenes: Scene[] = [
  {
    image: "/images/hero-bars.jpg",
    alt: "Kesilmiş Venti-Ate protein barları, içindeki gerçek fındık parçaları görünür şekilde",
    eyebrow: "01 · Kaynak",
    caption: "Gerçek Giresun fındığıyla başlar.",
  },
  {
    image: "/images/hand-bars.jpg",
    alt: "Elde tutulan kavrulmuş Venti-Ate protein barları",
    eyebrow: "02 · Kavurma",
    caption: "Karakteri kavurmayla açığa çıkar.",
  },
  {
    image: "/images/boxes-left.jpg",
    alt: "Venti-Ate ambalajları, iç yapı detayları görünür şekilde",
    eyebrow: "03 · Kırılma",
    caption: "Her parça, gerçek fındığın izini taşır.",
  },
  {
    image: "/images/cream-pour.jpg",
    alt: "Venti-Ate fındık kreması kavanozdan dökülürken",
    eyebrow: "04 · Krema",
    caption: "%50 fındık oranıyla krema olur.",
  },
  {
    image: "/images/boxes-right.jpg",
    alt: "Venti-Ate protein bar ambalajı, %25 protein etiketi görünür şekilde",
    eyebrow: "05 · Protein Bar",
    caption: "Gerçek fındık. Gerçek protein.",
  },
  {
    image: "/images/lifestyle-waffle.jpg",
    alt: "Venti-Ate ürünü günlük yaşamda, kahvaltı sofrasında kullanılırken",
    eyebrow: "06 · Kullanım",
    caption: "Çantana, antrenmana, güne katılır.",
  },
];

export function ScrollStory() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [usePinnedMode, setUsePinnedMode] = useState(false);

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const pinned = !reducedMotion && isDesktop;
    setUsePinnedMode(pinned);
    if (!pinned || !wrapperRef.current || !pinRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const images = imageRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
      gsap.set(images, { opacity: 0, scale: 1.12 });
      gsap.set(images[0], { opacity: 1, scale: 1 });

      let activeIndex = 0;
      function setActive(index: number) {
        if (index === activeIndex) return;
        activeIndex = index;
        if (eyebrowRef.current) eyebrowRef.current.textContent = scenes[index].eyebrow;
        if (captionRef.current) captionRef.current.textContent = scenes[index].caption;
        dotRefs.current.forEach((dot, i) => {
          if (!dot) return;
          dot.style.opacity = i === index ? "1" : "0.35";
          dot.style.transform = i === index ? "scale(1.4)" : "scale(1)";
        });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          pin: pinRef.current,
          start: "top top",
          end: `+=${scenes.length * 100}%`,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      scenes.forEach((_, i) => {
        if (i === 0) return;
        const prevImg = images[i - 1];
        const nextImg = images[i];
        tl.to(prevImg, { opacity: 0, scale: 0.94, ease: "power1.inOut", duration: 1 }, i - 1)
          .to(nextImg, { opacity: 1, scale: 1, ease: "power1.inOut", duration: 1 }, i - 1)
          .call(() => setActive(i), undefined, i - 1 + 0.5);
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  // ---- Pinned (masaüstü, animasyonlu) ----
  if (usePinnedMode) {
    return (
      <section
        ref={wrapperRef}
        aria-label="Venti-Ate'in hikayesi: kaynaktan günlük kullanıma"
        style={{ height: `${scenes.length * 100}vh` }}
        className="relative"
      >
        <div ref={pinRef} data-cursor-text="Kaydır" className="sticky top-0 h-screen w-full overflow-hidden bg-brown-darker">
          {scenes.map((scene, i) => (
            <div
              key={scene.image}
              ref={(el) => {
                imageRefs.current[i] = el;
              }}
              className="absolute inset-0"
            >
              <Image
                src={scene.image}
                alt={scene.alt}
                fill
                sizes="100vw"
                className="object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-brown-darker/45" />
            </div>
          ))}

          <div className="relative flex h-full max-w-6xl flex-col justify-end px-5 pb-16 mx-auto sm:pb-24">
            <p ref={eyebrowRef} className="mb-3 text-xs font-bold uppercase tracking-widest2 text-peach">
              {scenes[0].eyebrow}
            </p>
            <p ref={captionRef} className="max-w-lg font-display text-3xl font-extrabold leading-tight text-cream sm:text-5xl">
              {scenes[0].caption}
            </p>
          </div>

          {/* Bölüm işaretleri (item 13'ün bu sahneye özel küçük versiyonu) */}
          <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col gap-3 sm:flex" aria-hidden="true">
            {scenes.map((_, i) => (
              <span
                key={i}
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                className="h-2 w-2 rounded-full bg-peach transition-all duration-300"
                style={{ opacity: i === 0 ? 1 : 0.35, transform: i === 0 ? "scale(1.4)" : "scale(1)" }}
              />
            ))}
          </div>

          {/* Ekran okuyucu: pinned sahnedeki tüm anlatı gerçek DOM metni olarak da mevcut */}
          <ul className="sr-only">
            {scenes.map((scene) => (
              <li key={scene.image}>
                {scene.eyebrow}: {scene.caption}
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  // ---- Statik/mobil/reduced-motion fallback ----
  return (
    <section aria-label="Venti-Ate'in hikayesi: kaynaktan günlük kullanıma">
      {scenes.map((scene) => (
        <div key={scene.image} className="relative h-[70vh] overflow-hidden bg-brown-darker sm:h-[90vh]">
          <div className="absolute inset-0">
            <Image src={scene.image} alt={scene.alt} fill sizes="100vw" className="object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-brown-darker/45" />
          </div>
          <div className="relative flex h-full max-w-6xl flex-col justify-end px-5 pb-16 mx-auto sm:pb-24">
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
