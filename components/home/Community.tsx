import Image from "next/image";
import { Reveal } from "@/components/animations/Reveal";
import { brand } from "@/content/brand";

const demoGallery = [
  "/images/hand-bars.jpg",
  "/images/lifestyle-waffle.jpg",
  "/images/boxes-left.jpg",
  "/images/lifestyle-laptop.jpg",
  "/images/cream-pour.jpg",
  "/images/boxes-right.jpg",
];

export function Community() {
  const handle = brand.social.instagram.startsWith("[") ? "@ventiate" : brand.social.instagram;

  return (
    <section aria-labelledby="community-heading" className="mx-auto max-w-6xl px-5 py-28">
      <Reveal>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest2 text-green">Topluluk</p>
          <h2 id="community-heading" className="mt-3 font-display text-3xl font-extrabold text-brown-darker sm:text-4xl">
            {handle}
          </h2>
        </div>
        <span className="rounded-full bg-brown/5 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brown-dark/60">
          Örnek / Demo Galeri
        </span>
      </div>
      </Reveal>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {demoGallery.map((src, i) => (
          <Reveal key={src} delay={i * 60}>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-brown/5">
            <Image
              src={src}
              alt=""
              fill
              sizes="200px"
              loading="lazy"
              className="object-cover transition duration-300 hover:scale-105"
            />
            {i === 0 && <span className="sr-only">Örnek topluluk görselleri galerisi</span>}
          </div>
          </Reveal>
        ))}
      </div>

      <p className="mt-4 text-xs text-brown-dark/40">
        Bu galeri örnek/demo içeriktir — canlı Instagram bağlantısı henüz kurulmadı.
      </p>
    </section>
  );
}
