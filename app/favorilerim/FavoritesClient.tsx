"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatPrice } from "@/lib/utils/format";

type Favorite = {
  id: string;
  product_id: string;
  products: {
    name: string;
    slug: string;
    price: number;
    main_image_url: string | null;
    short_description: string | null;
  } | null;
};

export function FavoritesClient() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push("/uye-giris"); return; }
      const { data } = await supabase
        .from("favorites")
        .select("id, product_id, products(name, slug, price, main_image_url, short_description)")
        .eq("user_id", user.id);
      setFavorites((data ?? []) as unknown as Favorite[]);
      setLoading(false);
    });
  }, [router]);

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><p className="text-brown-dark/60">Yükleniyor…</p></div>;

  return (
    <>
      <PageHeader eyebrow="Hesabım" title="Favorilerim" />
      <div className="mx-auto max-w-4xl px-5 py-16">
        {favorites.length === 0 ? (
          <div className="rounded-2xl border border-brown/10 bg-white/70 p-12 text-center">
            <p className="text-brown-dark/60">Favori ürünün yok.</p>
            <Link href="/magaza" className="mt-6 inline-block rounded-full bg-brown-darker px-7 py-3 text-sm font-bold text-cream transition hover:bg-green">
              Mağazaya Git
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((fav) => {
              const p = fav.products;
              if (!p) return null;
              return (
                <Link key={fav.id} href={`/urun/${p.slug}`}
                  className="group overflow-hidden rounded-2xl border border-brown/10 bg-white/70 transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative aspect-square bg-brown/5">
                    {p.main_image_url && (
                      <Image src={p.main_image_url} alt={p.name} fill className="object-cover transition group-hover:scale-105" sizes="300px" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-display font-semibold text-brown-darker">{p.name}</p>
                    {p.short_description && <p className="mt-1 text-xs text-brown-dark/60">{p.short_description}</p>}
                    <p className="mt-3 font-bold text-brown-darker">{formatPrice(p.price)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
