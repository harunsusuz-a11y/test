# Venti-Ate

Giresun fındığı temelli, premium sağlıklı atıştırmalık markası Venti-Ate için Next.js e-ticaret sitesi.

> **Not:** Bu proje ilk olarak bir kahve markası (Venti Ate) konsepti olarak tasarlanmış, ardından kullanıcı onayıyla aynı sinematik/scroll deneyimi korunarak fındık/protein bar temasına uyarlanmıştır. Marka hikâyesi, değerleri ve içerikleri kullanıcının paylaştığı marka kitapçığından alınmıştır — uydurulmamıştır.

## Proje Ekran Görüntüsü

`[EKRAN GÖRÜNTÜSÜ EKLENECEK]`

## Demo Bağlantısı

```text
Production: [VERCEL PRODUCTION URL EKLENECEK]
Preview: [VERCEL PREVIEW URL EKLENECEK]
Repository: https://github.com/harunsusuz-a11y/test
```

## Kullanılan Teknolojiler

| Kütüphane | Amaç | Lisans |
|---|---|---|
| [Next.js](https://github.com/vercel/next.js) (App Router) | React framework, routing, SSR/SSG | MIT |
| [React](https://react.dev) 19 | UI kütüphanesi | MIT |
| [TypeScript](https://www.typescriptlang.org) | Tip güvenliği | Apache-2.0 |
| [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) | Utility-first CSS | MIT |
| [GSAP](https://github.com/greensock/GSAP) + ScrollTrigger | Scroll tabanlı ana animasyonlar (Hero, ScrollStory, açılış animasyonu) | Standard "No Charge" GSAP lisansı (ticari kullanım serbest; ücretli bonus eklentiler kullanılmadı) |
| [Lenis](https://github.com/darkroomengineering/lenis) | Yumuşak (smooth) scroll | MIT |
| [Motion](https://github.com/motiondivision/motion) (`motion/react`) | Basit UI geçişleri, mouse parallax | MIT |
| [Three.js](https://github.com/mrdoob/three.js) + [React Three Fiber](https://github.com/pmndrs/react-three-fiber) | Hero'daki hafif 3D fındık sahnesi (prosedürel geometri, harici model/texture yok) | MIT |
| [Zustand](https://github.com/pmndrs/zustand) | Sepet durum yönetimi | MIT |
| [Zod](https://github.com/colinhacks/zod) + [React Hook Form](https://github.com/react-hook-form/react-hook-form) | Form doğrulama | MIT |
| [Lucide Icons](https://github.com/lucide-icons/lucide) | İkonlar | ISC |
| [Vitest](https://github.com/vitest-dev/vitest) | Unit testler | MIT |
| [Playwright](https://github.com/microsoft/playwright) | E2E testler | Apache-2.0 |
| [Supabase](https://supabase.com) | Veritabanı, Auth, Storage | Apache-2.0 (istemci kütüphaneleri) |

Tüm bağımlılıklar güncel kararlı sürümlerle sabitlenmiştir (bkz. `package.json`).

## Yerel Kurulum

```bash
git clone https://github.com/harunsusuz-a11y/test.git
cd test
npm install
npm run dev
```

## Environment Variables

`.env.example` dosyasını `.env.local` olarak kopyalayıp doldurun:

```bash
cp .env.example .env.local
```

| Değişken | Açıklama |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Sitenin canlı adresi (SEO/metadata için) |
| `NEXT_PUBLIC_SITE_NAME` | Marka adı |
| `NEXT_PUBLIC_CONTACT_EMAIL` / `NEXT_PUBLIC_CONTACT_PHONE` | İletişim placeholder'ları |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase bağlantısı |
| `PAYMENT_PROVIDER_API_KEY` | Ödeme sağlayıcısı (henüz belirlenmedi — soyut katman, demo checkout) |

## Geliştirme Komutları

```bash
npm run dev         # Geliştirme sunucusu
npm run build       # Production build
npm run start       # Production sunucusu (build sonrası)
npm run lint        # ESLint
npm run typecheck   # TypeScript tip kontrolü
npm run test        # Vitest unit testleri
npm run test:e2e    # Playwright e2e testleri
```

## Proje Dizin Yapısı

```text
app/            → Next.js App Router sayfaları (route bazlı)
components/     → UI bileşenleri (home, product, commerce, quiz, three, providers, seo, ui...)
content/        → Merkezi marka/ürün/navigasyon/hukuki metin verisi (brand.ts, products.ts, ...)
lib/            → Yardımcı fonksiyonlar (format, seo, quiz puanlama)
store/          → Zustand sepet store'u
public/images/  → Ürün ve lifestyle görselleri
tests/unit/     → Vitest testleri
tests/e2e/      → Playwright testleri
```

## İçeriklerin Değiştirilmesi

- **Marka bilgisi:** `content/brand.ts` — hikaye, değerler, iletişim, sosyal medya
- **Ürün ekleme:** `content/products.ts` içine yeni bir obje ekleyin (slug, isim, fiyat, görsel, kategori vb.)
- **Navigasyon:** `content/navigation.ts`
- **Hukuki metinler:** `content/legal.ts` — bu metinler gerçek hukuk danışmanlığının yerine geçmez, yayına almadan önce bir hukuk danışmanına doğrulatılmalıdır

## Animasyonların Yönetimi

- **Hero & açılış animasyonu:** GSAP timeline (`components/layout/IntroSplash.tsx`, `components/home/Hero.tsx`)
- **Sayfa geneli smooth scroll:** Lenis + GSAP ScrollTrigger senkronizasyonu (`components/providers/SmoothScrollProvider.tsx`)
- **Scroll ile açılan sahneler:** GSAP ScrollTrigger scrub animasyonları (`components/home/ScrollStory.tsx`)
- **3D fındık sahnesi:** React Three Fiber, sadece Hero'da, `ssr:false` ile lazy-load (`components/three/HazelnutScene.tsx`)
- Tüm animasyonlar `prefers-reduced-motion: reduce` durumunda ya hiç çalışmaz ya da anında nihai duruma atlar.

## Performans Notları

- Server Components öncelikli; `"use client"` yalnızca etkileşim/animasyon gereken bileşenlerde
- 3D sahne dinamik import ile (`next/dynamic`, `ssr:false`) yalnızca istemcide ve yalnızca gerektiğinde yüklenir
- Next/Image ile otomatik görsel optimizasyonu (WebP/AVIF üretimi tarayıcı desteğine göre otomatik)
- Lighthouse hedefleri: Performance 90+, Accessibility 95+, Best Practices 95+, SEO 95+ — **bunlar ölçülmesi gereken hedeflerdir, garanti edilmiş sonuç değildir.** Yayına almadan önce gerçek bir Lighthouse taraması yapılmalıdır.

## Erişilebilirlik Notları

- `prefers-reduced-motion` desteği (açılış animasyonu, Hero, scroll animasyonları, Lenis)
- Skip link, görünür focus durumu, semantik HTML
- WCAG 2.2 AA hedeflenmiştir; bağımsız bir erişilebilirlik denetimiyle doğrulanmalıdır

## Credits

Bu proje, yukarıdaki tabloda listelenen açık kaynak kütüphaneler üzerine inşa edilmiştir. Üçüncü taraf kod doğrudan kopyalanmamış; her kütüphane resmi paket yöneticisi (npm) üzerinden kurulmuş ve proje ihtiyaçlarına göre yeniden düzenlenmiştir. Ürün/lifestyle görselleri `public/images/` altında yer alır.

## Lisans

Bu proje özel (private) bir marka için geliştirilmiştir. Kullanılan açık kaynak kütüphanelerin kendi lisansları (MIT, Apache-2.0, ISC) geçerlidir.

## Bilinen Eksikler ve Sonraki Adımlar

- GitHub Actions CI (`.github/workflows/ci.yml`) henüz eklenmedi
- Playwright e2e testleri yazıldı ancak bu ortamda tarayıcı bağlantı sorunu nedeniyle doğrulanamadı
- Gerçek ödeme sağlayıcısı entegre edilmedi (checkout demo/soyut katman)
- Supabase Auth henüz site koduna bağlanmadı (yalnızca veritabanı şeması hazır)
- Instagram canlı akışı yoktur — demo galeri olarak gösterilmektedir
- Vercel Analytics / Speed Insights opsiyonel entegrasyonu yapılmadı
