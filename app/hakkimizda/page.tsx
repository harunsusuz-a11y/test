import type { Metadata } from "next";
import Image from "next/image";
import { brand } from "@/content/brand";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: brand.shortStory,
};

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

      <div className="mx-auto max-w-2xl px-5 py-16">
        {paragraphs.map((p, i) => (
          <p key={i} className="mb-5 leading-relaxed text-brown-dark/90">
            {p}
          </p>
        ))}

        <h2 className="mt-12 font-display text-2xl font-extrabold text-brown-darker">Değerlerimiz</h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2">
          {brand.values.map((v) => (
            <li key={v.title} className="rounded-2xl bg-white/60 p-5">
              <p className="font-display font-bold text-brown-darker">{v.title}</p>
              <p className="mt-1.5 text-sm text-brown-dark/70">{v.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
