"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";
import { mainNav } from "@/content/navigation";
import { useCartStore } from "@/store/cart-store";

export function Header() {
  const [open, setOpen] = useState(false);
  const count = useCartStore((s) => s.count());

  return (
    <header className="sticky top-0 z-50 border-b border-brown/10 bg-cream/95 backdrop-blur">
      <a href="#main-content" className="skip-link">
        İçeriğe geç
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight text-brown">
          venti&#8209;ate
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Ana navigasyon">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-brown-dark transition hover:text-green"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/sepet"
            className="relative flex items-center gap-2 rounded-full border border-brown/20 px-4 py-2 text-sm font-medium text-brown-dark transition hover:border-green hover:text-green"
            aria-label={`Sepetim, ${count} ürün`}
          >
            <ShoppingBag size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Sepetim</span>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-green px-1 text-xs font-bold text-cream">
                {count}
              </span>
            )}
          </Link>

          <button
            className="md:hidden"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-brown/10 px-5 py-4 md:hidden" aria-label="Mobil navigasyon">
          <ul className="flex flex-col gap-3">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-1 text-base font-medium text-brown-dark"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
