"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function Footer() {
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
              <p className="text-xs font-semibold uppercase tracking-widest2 text-cream/50">{group.title}</p>
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
          <p>
            İletişim: <span className="text-cream/70">""</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
