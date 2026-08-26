import { Leaf, Zap, Star, Package } from "lucide-react";

const STEPS = [
  {
    Icon: Leaf,
    title: "Kaynak",
    desc: "Giresun fındığı — Türkiye'nin en kaliteli fındık havzasından, doğrudan üreticiden temin edilir.",
  },
  {
    Icon: Zap,
    title: "İşlem",
    desc: "Fındıklar kavrulduktan sonra protein karışımıyla buluşturulur. Dolgu maddesi, palm yağı yok.",
  },
  {
    Icon: Star,
    title: "Formül",
    desc: "%25 protein oranı (bar) ve %50 fındık oranı (krema) — piyasa ortalamasının çok üzerinde.",
  },
  {
    Icon: Package,
    title: "Teslimat",
    desc: "Her ürün sevgiyle paketlenir. 300₺ üzeri siparişlerde Yurtiçi Kargo ücretsiz.",
  },
];

export function ProcessSteps() {
  return (
    <section className="bg-[#56312D] py-20 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 flex flex-col items-center text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#F9C89E]">Nasıl Üretilir?</p>
          <h2 className="font-display text-3xl font-extrabold text-[#FFF6F0] md:text-4xl"
            style={{ fontFamily: "var(--font-fraunces, Georgia, serif)" }}>
            Fındıktan Çantana
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#F9C89E]/30 bg-[#F9C89E]/10">
                <step.Icon size={24} className="text-[#F9C89E]" />
              </div>
              {i < STEPS.length - 1 && (
                <div className="absolute hidden md:block" style={{ width: "calc(25% - 2rem)", height: "1px", background: "rgba(249,200,158,0.2)", top: "2rem", left: `calc(${i * 25}% + 4rem)` }} />
              )}
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#F9C89E]">
                {String(i + 1).padStart(2, "0")} — {step.title}
              </p>
              <p className="text-sm leading-relaxed text-[#FFF6F0]/70">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
