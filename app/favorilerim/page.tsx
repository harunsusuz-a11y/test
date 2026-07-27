import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Favorilerim" };

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Hesabım" title="Favorilerim" />
      <div className="mx-auto max-w-lg px-5 pb-24 text-center">
        <div role="note" className="rounded-xl border border-peach/60 bg-peach/15 px-5 py-4 text-sm text-brown-dark">
          Favori ürün listesi, hesap girişi bağlandığında kullanıcıya özel olarak burada saklanacaktır.
        </div>
      </div>
    </>
  );
}
