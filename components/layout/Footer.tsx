"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type NavGroup = { title: string; links: { label: string; href: string }[] };

const DEFAULT_NAV: NavGroup[] = [
  { title: "Alışveriş", links: [{ label: "Mağaza", href: "/magaza" }, { label: "Abonelik", href: "/abonelik" }, { label: "Sepetim", href: "/sepet" }] },
  { title: "Marka", links: [{ label: "Hakkımızda", href: "/hakkimizda" }, { label: "SSS", href: "/sss" }, { label: "İletişim", href: "/iletisim" }] },
  { title: "Kurumsal", links: [{ label: "Gizlilik", href: "/gizlilik" }, { label: "KVKK", href: "/kvkk" }, { label: "Mesafeli Satış", href: "/mesafeli-satis" }, { label: "İade ve Teslimat", href: "/iade-teslimat" }] },
];

export function Footer() {
  const [footerNav, setFooterNav] = useState<NavGroup[]>(DEFAULT_NAV);
  const [tagline, setTagline] = useState("Fındığın rafine hali");

  useEffect(() => {
    fetch("/api/settings/content?keys=nav_footer,brand_tagline")
      .then((r) => r.json())
      .then((d) => {
        if (d.nav_footer?.length) setFooterNav(d.nav_footer as NavGroup[]);
        if (d.brand_tagline) setTagline(d.brand_tagline as string);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="border-t border-brown/10 bg-brown-darker text-cream">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="font-display text-xl font-bold text-peach">venti&#8209;ate</p>
            <p className="mt-3 max-w-xs text-sm text-cream/70">{tagline}</p>
          </div>

          {footerNav.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold uppercase tracking-widest text-cream/50">{group.title}</p>
              <ul className="mt-4 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-cream/80 transition hover:text-peach">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-cream/10 pt-6 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Venti-Ate. Tüm hakları saklıdır.</p>
          <p>info@ventiateprotein.com</p>
        </div>
      </div>
    </footer>
  );
}
