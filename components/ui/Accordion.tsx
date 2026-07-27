"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function Accordion({ items }: { items: readonly { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-brown/10 rounded-2xl border border-brown/10 bg-white/50">
      {items.map((item, i) => {
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
  );
}
