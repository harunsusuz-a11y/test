"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import type { DbProduct } from "@/lib/data/products";

export function ProductSlider({ products }: { products: DbProduct[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);

  function scroll(dir: "left" | "right") {
    const el = track.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  }

  function onScroll() {
    const el = track.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  useEffect(() => {
    const el = track.current;
    if (el) { el.addEventListener("scroll", onScroll); onScroll(); }
    return () => el?.removeEventListener("scroll", onScroll);
  }, [products]);

  function fmt(n: number) {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
  }

  return (
    <section className="py-20 bg-[#FFF6F0]">
      <div className="mx-auto max-w-7xl px-6">
        {/* Başlık */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#415D1F]">Ürünler</p>
            <h2 className="font-display text-4xl font-extrabold text-[#56312D] md:text-5xl"
              style={{ fontFamily: "var(--font-fraunces, Georgia, serif)" }}>
              Keşfedin
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/magaza"
              className="text-sm font-medium text-[#56312D]/60 underline underline-offset-4 hover:text-[#56312D] transition-colors">
              Tümünü gör →
            </Link>
            <div className="flex gap-2">
              <button onClick={() => scroll("left")} disabled={!canLeft}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#56312D]/20 text-[#56312D] transition-all hover:border-[#56312D] hover:bg-[#56312D] hover:text-[#FFF6F0] disabled:opacity-20">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scroll("right")} disabled={!canRight}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#56312D]/20 text-[#56312D] transition-all hover:border-[#56312D] hover:bg-[#56312D] hover:text-[#FFF6F0] disabled:opacity-20">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Slider track */}
        <div ref={track}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {products.map((p) => (
            <article key={p.slug}
              className="group flex-shrink-0 w-64 md:w-72 bg-white overflow-hidden"
              >
              <Link href={`/urun/${p.slug}`} className="block aspect-square overflow-hidden bg-[#F9C89E]/20">
                {p.main_image_url ? (
                  <Image src={p.main_image_url} alt={p.name} width={400} height={400}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-6xl">🌰</div>
                )}
              </Link>
              <div className="p-5">
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#415D1F]">
                  {p.protein_percent ? `%${p.protein_percent} Protein` : p.hazelnut_percent ? `%${p.hazelnut_percent} Fındık` : "Venti-Ate"}
                </p>
                <Link href={`/urun/${p.slug}`}>
                  <h3 className="mb-3 font-semibold leading-snug text-[#2D1A0E] group-hover:text-[#56312D] transition-colors">
                    {p.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-[#56312D]">{fmt(p.price)}</span>
                    {p.compare_at_price && p.compare_at_price > p.price && (
                      <span className="ml-2 text-sm text-[#56312D]/40 line-through">{fmt(p.compare_at_price)}</span>
                    )}
                  </div>
                  <button
                    onClick={() => { addItem({ slug: p.slug, name: p.name, price: p.price, image: p.main_image_url ?? "" }); openCartDrawer(p.slug); }}
                    className="rounded-none bg-[#56312D] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#FFF6F0] transition-all hover:bg-[#415D1F]"
                    >
                    Ekle
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
