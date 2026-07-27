import Link from "next/link";
import Image from "next/image";
import { brand } from "@/content/brand";

export function BrandStory() {
  return (
    <section className="bg-brown-darker text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-24 md:grid-cols-2 md:items-center md:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
          <Image
            src="/images/lifestyle-waffle.jpg"
            alt="Venti-Ate fındık kreması gerçek bir kahvaltı sofrasında kullanılırken"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest2 text-peach">Marka Hikayesi</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            {brand.tagline}
          </h2>
          <p className="mt-6 max-w-lg text-cream/80">{brand.shortStory}</p>

          <ul className="mt-8 grid grid-cols-2 gap-5">
            {brand.values.map((v) => (
              <li key={v.title}>
                <p className="font-display text-sm font-bold text-peach">{v.title}</p>
                <p className="mt-1 text-xs text-cream/70">{v.description}</p>
              </li>
            ))}
          </ul>

          <Link
            href="/hakkimizda"
            className="mt-10 inline-block rounded-full border border-cream/30 px-7 py-3.5 text-sm font-bold transition hover:border-peach hover:text-peach"
          >
            Hikayenin Tamamını Oku
          </Link>
        </div>
      </div>
    </section>
  );
}
