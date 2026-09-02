import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Hakkımızda",
  description: "1910'dan beri fındıkla başlayan bir hikâye. Venti Ate, Giresun fındığının birikimini yeni nesil ürünlere taşıyor.",
  path: "/hakkimizda",
});

export default function HakkimizdaPage() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-5 py-20 md:py-28">

      {/* Eyebrow */}
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-green">
        Hikâyemiz
      </p>

      {/* Başlık */}
      <h1 className="font-display text-4xl font-extrabold leading-tight text-brown-darker md:text-5xl">
        Kökümüz Giresun'da.
        <br />
        Fındık başrolde.
      </h1>

      {/* İçerik */}
      <div className="mt-10 space-y-6 text-base leading-relaxed text-brown-dark/80">
        <p>
          1910'dan beri hikâyemizin merkezinde fındık var. Giresun'da başlayan ve nesiller boyunca
          devam eden bu yolculuk, ailemize fındık konusunda bir asrı aşan bir tecrübe kazandırdı.
          Bugün Venti Ate, bu mirastan doğuyor; geçmişten gelen bilgiyi, Giresun fındığının kendine
          özgü karakterini koruyarak yeni nesil ürünlere taşıyor.
        </p>

        <p>
          Venti Ate, bu birikimi bugünün dünyasına taşıma fikrinden doğdu.
        </p>

        <p>
          Çünkü iyi bir ürünün karmaşık olması gerektiğine inanmıyoruz. İyi malzeme, doğru reçete
          ve gerçekten iyi bir lezzet yeterli. Biz de en iyi bildiğimiz yerden başladık: Giresun
          fındığından.
        </p>

        <p>
          Kendine özgü aroması ve karakteriyle Giresun fındığını ürünlerimizin merkezine koyuyor;
          onu protein barlardan fındık ezmesi ve kremalarına uzanan yeni formlarda yeniden
          yorumluyoruz. Lezzeti ve fonksiyonelliği birbirinden ayırmadan, ne yediğini önemseyen ama
          iyi lezzetten de vazgeçmek istemeyenler için üretiyoruz.
        </p>

        <p>
          1910'dan bugüne değişmeyen şey, iyi fındığa olan inancımız. Değişen ise onu nasıl
          anlattığımız, nasıl ürettiğimiz ve dünyayla nasıl paylaştığımız.
        </p>
      </div>

      {/* Kapanış sloganı */}
      <div className="mt-14 border-t border-brown/10 pt-10">
        <p className="font-display text-2xl font-extrabold italic text-brown-darker md:text-3xl">
          Venti Ate, fındığın rafine hali.
        </p>
      </div>
    </main>
  );
}
