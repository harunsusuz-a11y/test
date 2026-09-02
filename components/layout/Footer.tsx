"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Instagram } from "lucide-react";

type NavGroup = { title: string; links: { label: string; href: string }[] };

const DEFAULT_NAV: NavGroup[] = [
  {
    title: "Alışveriş",
    links: [
      { label: "Tüm Ürünler", href: "/magaza" },
      { label: "Protein Bar", href: "/magaza/kategori/protein-bar" },
      { label: "Fındık Kreması", href: "/magaza/kategori/findik-kremasi" },
      { label: "Formunu Bul", href: "/formunu-bul" },
    ],
  },
  {
    title: "Marka",
    links: [
      { label: "Hakkımızda", href: "/hakkimizda" },
      { label: "Sıkça Sorulan Sorular", href: "/sss" },
      { label: "İletişim", href: "/iletisim" },
    ],
  },
  {
    title: "Kurumsal",
    links: [
      { label: "İade ve Teslimat", href: "/iade-teslimat" },
      { label: "Gizlilik Politikası", href: "/gizlilik" },
      { label: "KVKK", href: "/kvkk" },
      { label: "Çerez Politikası", href: "/cerez-politikasi" },
      { label: "Mesafeli Satış", href: "/mesafeli-satis" },
    ],
  },
];

const TRUST_ITEMS = [
  { label: "%25 Protein", sub: "Her barda garantili" },
  { label: "%50 Fındık", sub: "Kremalarda" },
  { label: "Giresun", sub: "Kaynak garantisi" },
  { label: "Palm Yağsız", sub: "Temiz içerik" },
];

export function Footer() {
  const [footerNav, setFooterNav] = useState<NavGroup[]>(DEFAULT_NAV);
  const [tagline, setTagline] = useState("Fındığın rafine hali");

  useEffect(() => {
    Promise.all([
      fetch("/api/menu/footer").then((r) => r.json()).catch(() => []),
      fetch("/api/settings/content?keys=brand_tagline").then((r) => r.json()).catch(() => ({})),
    ]).then(([items, settings]: [{ label: string; url: string }[], { brand_tagline?: string }]) => {
      if (settings?.brand_tagline) setTagline(settings.brand_tagline as string);
      if (items?.length) {
        const alisveris = items.filter((i) =>
          ["/magaza", "/sepet", "/formunu-bul", "/magaza/kategori/protein-bar", "/magaza/kategori/findik-kremasi"].includes(i.url)
        );
        const marka = items.filter((i) =>
          ["/hakkimizda", "/sss", "/iletisim"].includes(i.url)
        );
        const kurumsal = items.filter((i) =>
          ["/gizlilik", "/kvkk", "/mesafeli-satis", "/iade-teslimat", "/cerez-politikasi"].includes(i.url)
        );
        const groups: NavGroup[] = [];
        if (alisveris.length) groups.push({ title: "Alışveriş", links: alisveris.map((i) => ({ label: i.label, href: i.url })) });
        if (marka.length) groups.push({ title: "Marka", links: marka.map((i) => ({ label: i.label, href: i.url })) });
        if (kurumsal.length) groups.push({ title: "Kurumsal", links: kurumsal.map((i) => ({ label: i.label, href: i.url })) });
        if (groups.length) setFooterNav(groups);
      }
    });
  }, []);

  return (
    <footer className="relative overflow-hidden bg-[#1a0d0b] text-cream/80">

      {/* ── Arka plan doku ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 15% 80%, rgba(65,93,31,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 85% 20%, rgba(249,200,158,0.06) 0%, transparent 55%)",
        }}
      />

      {/* ── Trust şerit ── */}
      <div className="relative border-b border-cream/[0.06]">
        <div className="mx-auto max-w-6xl px-5">
          <ul className="grid grid-cols-2 divide-x divide-y divide-cream/[0.06] sm:grid-cols-4 sm:divide-y-0">
            {TRUST_ITEMS.map((item) => (
              <li key={item.label} className="flex flex-col items-center gap-1 px-4 py-5 text-center">
                <span className="font-display text-lg font-extrabold text-peach">{item.label}</span>
                <span className="text-[11px] uppercase tracking-widest text-cream/40">{item.sub}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Ana gövde ── */}
      <div className="relative mx-auto max-w-6xl px-5 pt-14 pb-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto_auto_auto] lg:gap-8">

          {/* Marka blok */}
          <div className="flex flex-col gap-5">
            <Link href="/" aria-label="Venti-Ate Ana Sayfa">
              <span
                className="inline-block font-display text-2xl font-extrabold leading-none tracking-tight text-peach"
                style={{ fontFamily: "var(--font-display)" }}
              >
                venti&#8209;ate
              </span>
            </Link>
            <p className="max-w-[18rem] text-sm leading-relaxed text-cream/55">{tagline} — Giresun fındığından üretilen, gerçek içerikli, yüksek proteinli atıştırmalıklar.</p>

            {/* Sosyal */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/ventiate"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/10 text-cream/50 transition hover:border-peach/40 hover:text-peach"
              >
                <Instagram size={15} />
              </a>
              <a
                href="https://tiktok.com/@ventiate"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/10 text-cream/50 transition hover:border-peach/40 hover:text-peach"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34v-7.1a8.16 8.16 0 0 0 4.77 1.52V6.27a4.85 4.85 0 0 1-1-.58z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Nav grupları */}
          {footerNav.map((group) => (
            <div key={group.title} className="flex flex-col gap-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-cream/30"
                style={{ fontFamily: "var(--font-accent)" }}>
                {group.title}
              </p>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-cream/60 transition-colors hover:text-peach"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Divider ── */}
        <div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-cream/10 to-transparent" />

        {/* ── Alt çizgi ── */}
        <div className="mt-6 flex flex-col gap-3 text-[11px] text-cream/30 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Venti-Ate. Tüm hakları saklıdır.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/gizlilik" className="hover:text-cream/60 transition-colors">Gizlilik</Link>
            <Link href="/kvkk" className="hover:text-cream/60 transition-colors">KVKK</Link>
            <Link href="/cerez-politikasi" className="hover:text-cream/60 transition-colors">Çerez</Link>
            <a href="mailto:info@ventiate.com" className="hover:text-cream/60 transition-colors">info@ventiate.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
