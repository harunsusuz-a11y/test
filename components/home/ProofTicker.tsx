import { Fragment } from "react";

/**
 * Hero'nun hemen altında yavaşça akan marka rozeti şeridi.
 * Yalnızca content/ dosyalarındaki DOĞRULANABİLİR iddialar kullanılır —
 * puan/yorum verisi şu an demo olduğundan burada gösterilmez; gerçek
 * yorum sistemi bağlandığında "4.9★" gibi bir rozet eklenebilir.
 * prefers-reduced-motion'da animasyon durur (globals.css) ve şerit statik kalır.
 */
const BADGES = [
  "%25 Protein",
  "Gerçek Giresun Fındığı",
  "%100 Yerli Üretim",
  "%50 Fındık İçeren Krema",
  "Sporcu Dostu Atıştırmalık",
];

export function ProofTicker() {
  return (
    <div className="overflow-hidden border-y border-brown/10 bg-white/50 py-4" aria-label="Marka özellikleri">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center">
        {/* Kesintisiz döngü için liste iki kez basılır; ikincisi ekran okuyucudan gizlenir */}
        {[false, true].map((hidden) => (
          <Fragment key={hidden ? "dup" : "main"}>
            {BADGES.map((badge) => (
              <span
                key={badge}
                aria-hidden={hidden || undefined}
                className={`flex items-center gap-10 text-xs font-bold uppercase tracking-widest2 text-brown-dark/60 ${
                  hidden ? "motion-reduce:hidden" : ""
                }`}
              >
                {badge}
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-peach" />
              </span>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
