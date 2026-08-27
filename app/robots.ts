import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ventiate.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Tüm arama motorları — indexlenecek sayfalar
        userAgent: "*",
        allow: [
          "/",
          "/magaza",
          "/magaza/",
          "/urun/",
          "/magaza/kategori/",
          "/hakkimizda",
          "/formunu-bul",
          "/abonelik",
          "/iletisim",
          "/sss",
          "/iade-teslimat",
          "/gizlilik",
          "/kvkk",
          "/cerez-politikasi",
          "/mesafeli-satis",
          "/on-bilgilendirme",
        ],
        disallow: [
          "/admin/",
          "/giris/",
          "/api/",
          "/uye-giris/",
          "/hesabim/",
          "/siparislerim/",
          "/favorilerim/",
          "/odeme/",
          "/siparis-basarili/",
          "/arama/",
          "/_next/",
          "/static/",
          "/*?*",
        ],
      },
      {
        // AI içerik tarayıcıları — tam engel
        userAgent: [
          "GPTBot",
          "CCBot",
          "anthropic-ai",
          "Claude-Web",
          "Omgilibot",
          "FacebookBot",
          "Bytespider",
          "PetalBot",
        ],
        disallow: "/",
      },
      {
        // Google özel — image preview izni
        userAgent: "Googlebot-Image",
        allow: ["/images/", "/og-image.jpg"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
