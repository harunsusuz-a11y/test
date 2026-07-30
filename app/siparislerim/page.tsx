import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch, Truck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Siparişlerim" };

/**
 * Boş durum: Favorilerim'deki çoğul kart grid'inden kasıtlı farklı bir çözüm —
 * burada TEK bir örnek sipariş kartı, gerçek şemadaki alan adlarıyla
 * (order_number formatı VA-YYYYMMDD-xxx, Supabase orders tablosu) net bir
 * "ÖRNEK" etiketiyle gösteriliyor. Amaç: hesap girişi bağlanınca gerçek
 * bir siparişin tam olarak nasıl görüneceğini önceden hissettirmek.
 */
export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Hesabım" title="Siparişlerim" />
      <div className="mx-auto max-w-md px-5 pb-24 pt-12">
        <div className="text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brown/5">
            <PackageSearch size={20} className="text-brown-dark/50" aria-hidden="true" />
          </span>
          <p className="text-sm text-brown-dark/70">
            Sipariş geçmişi, hesap girişi ve sipariş yönetim sistemi bağlandığında burada listelenecektir.
          </p>
        </div>

        {/* Tek örnek sipariş kartı — soluk, "ÖRNEK" rozetli */}
        <div className="relative mt-8 rounded-2xl border border-dashed border-brown/20 bg-white/40 p-5 opacity-70">
          <span className="absolute -top-2.5 left-5 rounded-full bg-brown-darker px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-cream">
            Örnek
          </span>
          <div className="flex items-center justify-between text-sm">
            <span className="font-mono text-xs text-brown-dark/60">VA-20260730-042</span>
            <span className="flex items-center gap-1.5 rounded-full bg-green/10 px-2.5 py-1 text-xs font-semibold text-green">
              <Truck size={12} aria-hidden="true" />
              Kargoda
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-brown/10 pt-3">
            <p className="text-sm text-brown-dark/70">2 ürün</p>
            <p className="font-display font-bold text-brown-darker">{formatPrice(189.8)}</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/magaza"
            className="btn-signature inline-block bg-brown px-8 py-4 text-sm font-bold text-cream transition hover:bg-green active:scale-[0.98]"
          >
            Alışverişe Başla
          </Link>
        </div>
      </div>
    </>
  );
}
