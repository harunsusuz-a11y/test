import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ventiate.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/magaza", "/urun/", "/magaza/kategori/", "/hakkimizda", "/formunu-bul", "/abonelik", "/iletisim", "/sss"],
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
          "/_next/",
          "/static/",
        ],
      },
      {
        // AI botlarını dışla
        userAgent: ["GPTBot", "CCBot", "anthropic-ai", "Claude-Web"],
        disallow: "/",
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
