/**
 * Site geneli editorial sayfa açılışı. Eski ortalanmış küçük başlık yerine:
 * koyu kahve zemin, sol hizalı dev Fraunces başlık, arkada içi boş (stroke)
 * eyebrow tipografisi ve film grain dokusu — ana sayfa/PDP hero diliyle aynı aile.
 * Bu bileşeni kullanan TÜM sayfalar (mağaza, sepet, iletişim, abonelik, SSS,
 * hukuki sayfalar...) otomatik olarak bu açılışı alır.
 */
import { HazelnutMark } from "@/components/brand/HazelnutMark";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="relative overflow-hidden bg-brown-darker text-cream">
      {eyebrow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-2 left-0 select-none whitespace-nowrap font-display text-[18vw] font-extrabold uppercase leading-none opacity-10 sm:text-[11vw]"
          style={{ WebkitTextStroke: "1.5px #F9C89E", color: "transparent" }}
        >
          {eyebrow}
        </div>
      )}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]">
        <filter id="page-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#page-grain)" />
      </svg>

      <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-24 sm:pb-16 sm:pt-28">
        {eyebrow && (
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest2 text-peach">
            <HazelnutMark size={15} />
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 max-w-3xl -translate-x-0.5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:translate-x-2 sm:text-6xl">
          {title}
        </h1>
        {description && <p className="mt-5 max-w-xl text-lg text-cream/70">{description}</p>}
      </div>
    </div>
  );
}
