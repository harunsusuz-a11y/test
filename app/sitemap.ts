import type { MetadataRoute } from "next";
import { products } from "@/content/products";

const staticRoutes = [
  "",
  "/magaza",
  "/hakkimizda",
  "/formunu-bul",
  "/sepet",
  "/sss",
  "/iletisim",
  "/gizlilik",
  "/kvkk",
  "/cerez-politikasi",
  "/mesafeli-satis",
  "/on-bilgilendirme",
  "/iade-teslimat",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticEntries = staticRoutes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
  }));

  const productEntries = products.map((p) => ({
    url: `${base}/urun/${p.slug}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...productEntries];
}
