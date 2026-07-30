import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { products } from "@/content/products";

export const metadata: Metadata = { title: "Favorilerim" };

/**
 * Boş durum: sadece metin yerine, hesap girişi bağlandığında favori
 * kartlarının nasıl görüneceğini gösteren soluk bir önizleme grid'i.
 * ui-ux-pro-max "empty state'i fırsata çevir" kuralı — Siparişlerim'den
 * (tek örnek kart) kasıtlı farklı bir görsel çözüm: burada çoğulluk var.
 */
export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Hesabım" title="Favorilerim" />
      <div className="mx-auto max-w-4xl px-5 pb-24 pt-12">
        <div className="text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brown/5">
            <Heart size={20} className="text-brown-dark/50" aria-hidden="true" />
          </span>
          <p className="mx-auto max-w-md text-sm text-brown-dark/70">
            Favori ürün listesi, hesap girişi bağlandığında kullanıcıya özel olarak burada saklanacaktır.
            Kartlar şöyle görünecek:
          </p>
        </div>

        {/* Soluk önizleme — gerçek ürün görselleriyle ama etkileşimsiz */}
        <div className="pointer-events-none mt-8 grid grid-cols-2 gap-4 opacity-40 grayscale sm:grid-cols-3">
          {products.map((p) => (
            <div key={p.slug} className="overflow-hidden rounded-2xl border border-brown/10">
              <div className="relative aspect-square bg-brown/5">
                <Image src={p.image} alt="" fill sizes="200px" className="object-cover" />
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-brown-darker">{p.name}</p>
              </div>
            </div>
          ))}
          {/* Üçüncü sütunu doldurmak için placeholder kart */}
          <div className="hidden items-center justify-center rounded-2xl border border-dashed border-brown/15 sm:flex">
            <Heart size={22} className="text-brown-dark/20" aria-hidden="true" />
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/magaza"
            className="btn-signature inline-block bg-brown px-8 py-4 text-sm font-bold text-cream transition hover:bg-green active:scale-[0.98]"
          >
            Ürünleri Keşfet
          </Link>
        </div>
      </div>
    </>
  );
}
