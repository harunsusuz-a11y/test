import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { products, categories } from "@/content/products";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ventiate.com";

const STATIC: MetadataRoute.Sitemap = [
  // Tier 1 — Ticari
  { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
  { url: `${BASE}/magaza`, lastModified: new Date(), changeFrequency: "daily", priority: 0.95 },
  { url: `${BASE}/abonelik`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
  { url: `${BASE}/formunu-bul`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },

  // Tier 2 — Kategori
  { url: `${BASE}/magaza/kategori/protein-bar`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
  { url: `${BASE}/magaza/kategori/findik-kremasi`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },

  // Tier 3 — Kurumsal
  { url: `${BASE}/hakkimizda`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE}/iletisim`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.45 },
  { url: `${BASE}/sss`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.45 },

  // Tier 4 — Hukuki (index'te olsun ama düşük öncelik)
  { url: `${BASE}/iade-teslimat`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  { url: `${BASE}/gizlilik`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.15 },
  { url: `${BASE}/kvkk`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.15 },
  { url: `${BASE}/cerez-politikasi`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.1 },
  { url: `${BASE}/mesafeli-satis`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.1 },
  { url: `${BASE}/on-bilgilendirme`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.1 },
];

// Statik ürünler — DB yokken fallback
const STATIC_PRODUCTS: MetadataRoute.Sitemap = products.map((p) => ({
  url: `${BASE}/urun/${p.slug}`,
  lastModified: new Date(),
  changeFrequency: "weekly" as const,
  priority: 0.9,
}));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = await createClient();

    const [{ data: dbProducts }, { data: dbCategories }, { data: blogs }] = await Promise.all([
      supabase.from("products").select("slug, updated_at").eq("status", "active").is("deleted_at", null),
      supabase.from("categories").select("slug, updated_at").eq("is_active", true),
      supabase.from("blog_posts").select("slug, updated_at").eq("status", "published"),
    ]);

    const productEntries: MetadataRoute.Sitemap =
      dbProducts && dbProducts.length > 0
        ? dbProducts.map((p) => ({
            url: `${BASE}/urun/${p.slug}`,
            lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
          }))
        : STATIC_PRODUCTS;

    const categoryEntries: MetadataRoute.Sitemap = (dbCategories ?? []).map((c) => ({
      url: `${BASE}/magaza/kategori/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    const blogEntries: MetadataRoute.Sitemap = (blogs ?? []).map((b) => ({
      url: `${BASE}/blog/${b.slug}`,
      lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    }));

    // Kategori sitemap'i: statik olanlar + DB'den gelenler birleştir (dedup)
    const allCategories = [...STATIC.filter((s) => s.url.includes("/magaza/kategori/"))];
    const dbCatUrls = new Set(categoryEntries.map((c) => c.url));
    const uniqueStaticCats = allCategories.filter((s) => !dbCatUrls.has(s.url));

    return [
      ...STATIC.filter((s) => !s.url.includes("/magaza/kategori/")),
      ...uniqueStaticCats,
      ...categoryEntries,
      ...productEntries,
      ...blogEntries,
    ];
  } catch {
    // DB bağlantısı yoksa statik + fallback ürünler
    return [...STATIC, ...STATIC_PRODUCTS];
  }
}
