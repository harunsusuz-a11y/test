"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

export function Accordion({ items }: { items: readonly { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 rounded-full border border-brown/20 bg-white/60 px-4 py-2.5">
        <Search size={16} className="text-brown-dark/50" aria-hidden="true" />
        <label htmlFor="faq-search" className="sr-only">
          Sorularda ara
        </label>
        <input
          id="faq-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sorularda ara…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-brown-dark/40"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-brown/10 bg-white/50 px-5 py-8 text-center text-sm text-brown-dark/60">
          &ldquo;{query}&rdquo; ile eşleşen bir soru bulamadık.
        </p>
      ) : (
        <div className="divide-y divide-brown/10 rounded-2xl border border-brown/10 bg-white/50">
          {filtered.map((item) => {
            const i = items.indexOf(item);
            const open = openIndex === i;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={open}
                  aria-controls={`faq-panel-${i}`}
                  onClick={() => setOpenIndex(open ? null : i)}
                >
                  <span className="font-display font-bold text-brown-darker">{item.question}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-brown transition-transform ${open ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {open && (
                  <div id={`faq-panel-${i}`} className="px-5 pb-5 text-sm text-brown-dark/80">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
