import Image from "next/image";
import Link from "next/link";

export function BrandStorySection() {
  return (
    <section className="bg-[#FFF6F0] py-24 px-6">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2 md:items-center">
        {/* Metin */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#415D1F]">Kimiz?</p>
          <h2 className="font-display mb-6 text-4xl font-extrabold leading-tight text-[#56312D] md:text-5xl"
            style={{ fontFamily: "var(--font-fraunces, Georgia, serif)" }}>
            Fındığı Merkeze<br />Aldık.
          </h2>
          <p className="mb-4 text-base leading-relaxed text-[#2D1A0E]/70">
            Venti-Ate olarak Giresun fındığını sadece bir malzeme değil, ürünün kendisi olarak konumlandırıyoruz.
            Protein barlarımızda gerçek fındık parçaları var — aroma vermesi değil, hammadde olarak.
          </p>
          <p className="mb-8 text-base leading-relaxed text-[#2D1A0E]/70">
            Kremalarda palm yağı yok, dolgu maddesi yok. %50 fındık oranı piyasa ortalamasının çok üzerinde.
            Sporcu, meraklı, bilinçli — herkes için.
          </p>
          <Link href="/hakkimizda"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#56312D] underline underline-offset-8 hover:text-[#415D1F] transition-colors">
            Tanışalım →
          </Link>
        </div>

        {/* Görsel */}
        <div className="relative">
          <div className="aspect-[3/4] overflow-hidden bg-[#F9C89E]/20"
            style={{ clipPath: "polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)" }}>
            <Image src="/images/hand-bars.jpg" alt="Venti-Ate fındıklı bar" fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover" />
          </div>
          {/* Badge */}
          <div className="absolute -bottom-6 -left-6 flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#415D1F] text-center text-[#FFF6F0]">
            <span className="text-2xl font-extrabold leading-none">%25</span>
            <span className="text-[9px] font-semibold uppercase tracking-widest">Protein</span>
            <span className="mt-0.5 text-[9px] opacity-70">Bar başına</span>
          </div>
        </div>
      </div>
    </section>
  );
}
