"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { mainNav } from "@/content/navigation";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";

export function Header() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(!isHome);
  // Scroll yönüne duyarlı header: aşağı kaydırınca gizlenir, yukarı kaydırınca
  // (veya en üste dönünce) hemen belirir — premium-frontend-ui'nin "fluid
  // navigation" ilkesi. Menü açıkken veya en üstteyken asla gizlenmez.
  const [hidden, setHidden] = useState(false);

  const cartLines = useCartStore((s) => s.lines);
  const hydrate = useCartStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    setCount(cartLines.reduce((sum, l) => sum + l.quantity, 0));
  }, [cartLines]);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
    }
    let lastY = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      if (isHome) setScrolled(y > 80);
      if (y < 120) {
        setHidden(false);
      } else if (y > lastY + 4) {
        setHidden(true); // aşağı kaydırma
      } else if (y < lastY - 4) {
        setHidden(false); // yukarı kaydırma
      }
      lastY = y;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Ana sayfada, hero üzerindeyken header transparan + kontrast metin;
  // scroll sonrası veya diğer sayfalarda krem/blur zemine geçer.
  const floating = isHome && !scrolled;

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-500 motion-reduce:!translate-y-0 ${
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      } ${
        floating
          ? "border-transparent bg-gradient-to-b from-black/45 via-black/15 to-transparent"
          : "border-brown/10 bg-cream/90 backdrop-blur-md"
      }`}
    >
      <a href="#main-content" className="skip-link">
        İçeriğe geç
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link
          href="/"
          className={`font-display text-2xl font-semibold italic tracking-tight transition-colors duration-500 ${
            floating ? "text-cream" : "text-brown-darker"
          }`}
        >
          venti&#8209;ate
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Ana navigasyon">
          {mainNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group relative text-[13px] font-medium uppercase tracking-wide transition-colors duration-300 ${
                  floating ? "text-cream/85 hover:text-cream" : "text-brown-dark/80 hover:text-green"
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${
                    floating ? "bg-cream" : "bg-green"
                  } ${active ? "scale-x-100" : ""}`}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <form
            action="/arama"
            className={`hidden items-center gap-2 rounded-full border px-4 py-2 transition-colors duration-500 focus-within:border-green lg:flex ${
              floating ? "border-cream/30" : "border-brown/20"
            }`}
          >
            <Search size={16} className={floating ? "text-cream/70" : "text-brown-dark/60"} aria-hidden="true" />
            <label htmlFor="site-search" className="sr-only">
              Ürün ara
            </label>
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder="Ürün ara"
              className={`w-32 bg-transparent text-sm outline-none ${
                floating ? "text-cream placeholder:text-cream/50" : "placeholder:text-brown-dark/50"
              }`}
            />
          </form>

          {/* Sepet artık yandan açılan çekmecede — sayfa geçişi yok */}
          <button
            type="button"
            onClick={() => openCartDrawer()}
            className={`relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition duration-500 ${
              floating
                ? "border-cream/30 text-cream hover:border-cream"
                : "border-brown/20 text-brown-dark hover:border-green hover:text-green"
            }`}
            aria-label={`Sepetim, ${count} ürün`}
            aria-haspopup="dialog"
          >
            <ShoppingBag size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Sepetim</span>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-green px-1 text-xs font-bold text-cream">
                {count}
              </span>
            )}
          </button>

          <button
            className={`md:hidden transition-colors duration-500 ${floating ? "text-cream" : "text-brown-darker"}`}
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
