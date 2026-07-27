import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Siparişlerim" };

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Hesabım" title="Siparişlerim" />
      <div className="mx-auto max-w-md px-5 pb-24 text-center pt-12">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brown/5">
          <PackageSearch size={20} className="text-brown-dark/50" aria-hidden="true" />
        </span>
        <p className="text-sm text-brown-dark/70">
          Sipariş geçmişi, hesap girişi ve sipariş yönetim sistemi bağlandığında burada listelenecektir. Şu
          an demo checkout akışı siparişi kaydetmiyor.
        </p>
        <Link
          href="/magaza"
          className="mt-6 inline-block rounded-full bg-brown px-7 py-3.5 text-sm font-bold text-cream transition hover:bg-green"
        >
          Alışverişe Başla
        </Link>
      </div>
    </>
  );
}
