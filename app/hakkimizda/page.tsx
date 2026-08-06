import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Sprout, Leaf, Flame, Wind } from "lucide-react";
import { brand } from "@/content/brand";
import { Reveal } from "@/components/animations/Reveal";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Venti-Ate'in hikayesi: Giresun fındığını merkeze alan, temiz içerik ve güçlü lezzetle sağlıklı atıştırmalık kategorisinde yeni bir standart kurmayı hedefleyen Türk markası.",
  keywords: ["Venti-Ate hakkında", "Giresun fındığı markası", "sağlıklı atıştırmalık Türkiye", "fındık protein bar markası"],
  alternates: { canonical: "/hakkimizda" },
  openGraph: {
    title: "Hakkımızda | Venti-Ate",
    description: brand.shortStory,
    images: [{ url: "/images/hand-bars.jpg", width: 1200, height: 630, alt: "Venti-Ate protein barları" }],
  },
};

const valueIcons = [Sprout, Leaf, Flame, Wind];

const galleryImages = [
  { src: "/images/boxes-left.jpg", alt: "Venti-Ate ambalajları" },
  { src: "/images/cream-pour.jpg", alt: "Venti-Ate fındık kreması" },
  { src: "/images/boxes-right.jpg", alt: "Venti-Ate protein bar ambalajı" },
];

export default function Page() {
  const paragraphs = brand.fullStory.split("\n\n");

  return (
    <article>
      <div className="relative h-[50vh] min-h-[360px] overflow-hidden bg-brown-darker">
        <Image
          src="/images/hand-bars.jpg"
          alt="Elde tutulan Venti-Ate protein barları"
          fill
          sizes="100vw"
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-brown-darker via-brown-darker/30 to-transparent">
          <div className="mx-auto w-full max-w-3xl px-5 pb-12">
            <p className="text-xs font-bold uppercase tracking-widest2 text-peach">Hikayemiz</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold text-cream sm:text-5xl">{brand.tagline}</h1>
          </div>
        </div>
      </div>

      {/* Editorial 2 kolon: sol sticky görsel şeridi, sağ hikaye metni */}
      <div className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              {galleryImages.map((img) => (
                <div key={img.src} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-brown/5">
                  <Image src={img.src} alt={img.alt} fill sizes="400px" className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <blockquote className="mb-8 border-l-2 border-green pl-5 font-display text-2xl italic text-brown-darker">
              {brand.shortStory}
            </blockquote>

            {paragraphs.map((p, i) => (
              <p key={i} className="mb-5 leading-relaxed text-brown-dark/90">
                {p}
              </p>
            ))}
          </div>
        </div>
        </Reveal>

        <Reveal>
          <p className="mt-20 text-xs font-bold uppercase tracking-widest2 text-green">İlkelerimiz</p>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-brown-darker">Değerlerimiz</h2>
        </Reveal>
        <ul className="mt-6 divide-y divide-brown/10 border-y border-brown/10">
          {brand.values.map((v, i) => {
            const Icon = valueIcons[i % valueIcons.length];
            return (
              <Reveal key={v.title} delay={i * 45}>
                <li className="flex items-start gap-4 py-5">
                  <Icon size={17} className="mt-0.5 shrink-0 text-green" aria-hidden="true" />
                  <div>
                    <p className="font-display font-bold text-brown-darker">{v.title}</p>
                    <p className="mt-1 text-sm text-brown-dark/70">{v.description}</p>
                  </div>
                </li>
              </Reveal>
            );
          })}
        </ul>

        <Reveal>
          <div className="mt-20 rounded-3xl bg-brown-darker px-8 py-12 text-center sm:px-16">
            <p className="font-display text-2xl font-extrabold text-cream sm:text-3xl">
              Hikayemizin bir parçası olmaya hazır mısın?
            </p>
            <Link
              href="/magaza"
              className="btn-signature mt-6 inline-block bg-peach px-8 py-4 text-sm font-bold text-brown-darker transition hover:bg-cream active:scale-[0.98]"
            >
              Ürünleri Keşfet
            </Link>
          </div>
        </Reveal>
      </div>
    </article>
  );
}
