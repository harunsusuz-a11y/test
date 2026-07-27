"use client";

import { useState } from "react";

type Note = { key: string; label: string; description: string; accent: string };

const notes: Note[] = [
  { key: "findik", label: "Kavrulmuş Fındık", description: "Giresun fındığının doğal, yoğun karakteri.", accent: "#56312D" },
  { key: "tiramisu", label: "Tiramisu", description: "Hafif kahve ve kakao dokunuşuyla dengelenmiş tatlılık.", accent: "#3A2019" },
  { key: "citir", label: "Çıtır Doku", description: "İlk ısırıkta hissedilen, gerçek fındık parçaları.", accent: "#415D1F" },
  { key: "krema", label: "Sürülebilir Krema", description: "Pürüzsüz kıvam, yoğun fındık oranı.", accent: "#5C7A34" },
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
        <div
          className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl transition-colors duration-500"
          style={{ backgroundColor: activeNote.accent }}
          aria-hidden="true"
        >
          <span className="font-display text-2xl font-extrabold text-cream/90">{activeNote.label}</span>
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
          <p role="tabpanel" className="mt-6 max-w-md text-brown-dark/70">
            {activeNote.description}
          </p>
        </div>
      </div>
    </section>
  );
}
