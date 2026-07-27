"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FaqItem = { question: string; answer: string };

export function ProductFaq({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-brown/10 border-y border-brown/10">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
            >
              <span className="font-semibold text-brown-darker">{item.question}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-brown-dark/50 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
            {open && <p className="pb-4 text-sm leading-relaxed text-brown-dark/75">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
