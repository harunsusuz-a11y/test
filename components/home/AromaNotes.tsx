"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

type Note = {
  key: string;
  label: string;
  description: string;
  accent: string;
  image: string;
  alt: string;
};

const notes: Note[] = [
  {
    key: "findik",
    label: "Kavrulmuş Fındık",
    description: "Giresun fındığının doğal, yoğun karakteri.",
    accent: "#56312D",
    image: "/images/hand-bars.jpg",
    alt: "Elde tutulan kavrulmuş Venti-Ate protein barları",
  },
  {
    key: "tiramisu",
    label: "Tiramisu",
    description: "Hafif kahve ve kakao dokunuşuyla dengelenmiş tatlılık.",
    accent: "#3A2019",
    image: "/images/hero-bars.jpg",
    alt: "Tiramisu fındıklı protein bar, kesitte gerçek fındık parçalarıyla",
  },
  {
    key: "citir",
    label: "Çıtır Doku",
    description: "İlk ısırıkta hissedilen, gerçek fındık parçaları.",
    accent: "#415D1F",
    image: "/images/boxes-left.jpg",
    alt: "Venti-Ate ambalajları, çıtır dokulu iç yapı görünür şekilde",
  },
  {
    key: "krema",
    label: "Sürülebilir Krema",
    description: "Pürüzsüz kıvam, yoğun fındık oranı.",
    accent: "#5C7A34",
    image: "/images/cream-pour.jpg",
    alt: "Venti-Ate fındık kreması kavanozdan dökülürken",
  },
];

export function AromaNotes() {
  const [active, setActive] = useState(notes[0].key);
  const activeNote = notes.find((n) => n.key === active) ?? notes[0];

  return (
    <section aria-labelledby="aroma-heading" className="mx-auto max-w-6xl px-5 py-24">
      <p className="text-xs font-bold uppercase tracking-widest2 text-green">Lezzet Notaları</p>
      <h2 id="aroma-heading" className="mt-3 max-w-lg font-display text-3xl font-extrabold text-brown-darker sm:text-4xl">
        Her ısırıkta farklı bir katman.
      </h2>

      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-center">
        <div className="relative aspect-square overflow-hidden rounded-3xl" aria-hidden="true">
          <AnimatePresence mode="sync">
            <motion.div
              key={activeNote.key}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <Image src={activeNote.image} alt={activeNote.alt} fill sizes="(min-width: 768px) 40vw, 90vw" className="object-cover" />
              <div className="absolute inset-0" style={{ backgroundColor: activeNote.accent, opacity: 0.38 }} />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brown-darker/70 to-transparent p-6">
            <span className="font-display text-2xl font-extrabold text-cream">{activeNote.label}</span>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap gap-3" role="tablist" aria-label="Lezzet notaları">
            {notes.map((note) => (
              <button
                key={note.key}
                type="button"
                role="tab"
                aria-selected={active === note.key}
                onClick={() => setActive(note.key)}
                className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
                  active === note.key
                    ? "border-green bg-green/10 text-green"
                    : "border-brown/20 text-brown-dark hover:border-green/50"
                }`}
              >
                {note.label}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={activeNote.key}
              role="tabpanel"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 max-w-md text-brown-dark/70"
            >
              {activeNote.description}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
