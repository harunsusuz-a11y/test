"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { PageHeader } from "@/components/ui/PageHeader";

export function AccountClient() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
      if (!user) router.push("/uye-giris");
    });
  }, [router]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><p className="text-brown-dark/60">Yükleniyor…</p></div>;
  if (!user) return null;

  return (
    <>
      <PageHeader eyebrow="Hoş geldin" title="Hesabım" />
      <div className="mx-auto max-w-3xl px-5 py-16">
        <div className="rounded-2xl border border-brown/10 bg-white/70 p-8">
          <dl className="space-y-4">
            <div className="flex gap-4 border-b border-brown/10 pb-4">
              <dt className="w-32 text-sm font-semibold text-brown-dark/60">E-posta</dt>
              <dd className="text-sm text-brown-darker">{user.email}</dd>
            </div>
            <div className="flex gap-4 border-b border-brown/10 pb-4">
              <dt className="w-32 text-sm font-semibold text-brown-dark/60">Üye ID</dt>
              <dd className="font-mono text-xs text-brown-dark/60">{user.id}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-32 text-sm font-semibold text-brown-dark/60">Kayıt tarihi</dt>
              <dd className="text-sm text-brown-darker">
                {new Date(user.created_at).toLocaleDateString("tr-TR")}
              </dd>
            </div>
          </dl>
          <div className="mt-8 flex gap-4">
            <a href="/siparislerim" className="rounded-full border border-brown/20 px-6 py-2.5 text-sm font-medium text-brown-dark transition hover:border-green hover:text-green">
              Siparişlerim
            </a>
            <a href="/favorilerim" className="rounded-full border border-brown/20 px-6 py-2.5 text-sm font-medium text-brown-dark transition hover:border-green hover:text-green">
              Favorilerim
            </a>
            <button onClick={handleSignOut} className="rounded-full border border-red-200 px-6 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50">
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
