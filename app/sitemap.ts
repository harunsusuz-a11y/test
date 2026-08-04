import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ventiate.com";

const STATIC: MetadataRoute.Sitemap = [
  { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
  { url: `${BASE}/magaza`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  { url: `${BASE}/hakkimizda`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE}/formunu-bul`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE}/abonelik`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE}/iletisim`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  { url: `${BASE}/sss`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  { url: `${BASE}/gizlilik`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  { url: `${BASE}/kvkk`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  { url: `${BASE}/cerez-politikasi`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  { url: `${BASE}/mesafeli-satis`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  { url: `${BASE}/on-bilgilendirme`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  { url: `${BASE}/iade-teslimat`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = await createClient();

    const [{ data: products }, { data: categories }, { data: blogs }] = await Promise.all([
      supabase.from("products").select("slug, updated_at").eq("status", "active").is("deleted_at", null),
      supabase.from("categories").select("slug, updated_at").eq("is_active", true),
      supabase.from("blog_posts").select("slug, updated_at").eq("status", "published"),
    ]);

    const productEntries: MetadataRoute.Sitemap = (products ?? []).map(p => ({
      url: `${BASE}/urun/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categoryEntries: MetadataRoute.Sitemap = (categories ?? []).map(c => ({
      url: `${BASE}/kategori/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    const blogEntries: MetadataRoute.Sitemap = (blogs ?? []).map(b => ({
      url: `${BASE}/blog/${b.slug}`,
      lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    }));

    return [...STATIC, ...productEntries, ...categoryEntries, ...blogEntries];
  } catch {
    // DB bağlantısı yoksa sadece statik sayfaları döndür
    return STATIC;
  }
}
