import { createClient } from "@/lib/supabase/server";
import type { DbProduct } from "./products";

export async function getProductsServer(): Promise<DbProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    // Fallback: static products.ts
    const { products } = await import("@/content/products");
    return products.map((p) => ({
      id: p.slug,
      name: p.name,
      slug: p.slug,
      short_description: p.shortDescription,
      description: p.description,
      price: p.price,
      compare_at_price: p.compareAtPrice ?? null,
      main_image_url: p.image,
      gallery_images: p.gallery,
      status: "active",
      is_featured: true,
      is_bestseller: false,
      protein_percent: p.proteinPercent ?? null,
      hazelnut_percent: p.hazelnutPercent ?? null,
      flavor: p.flavor,
      highlights: p.highlights,
      nutrition_per_100g: p.nutritionPer100g,
      category_id: null,
      weight: p.weightGrams ?? null,
    }));
  }
  return data as DbProduct[];
}

export async function getProductBySlugServer(slug: string): Promise<DbProduct | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .is("deleted_at", null)
    .single();

  if (error || !data) {
    // Fallback static
    const { getProductBySlug } = await import("@/content/products");
    const p = getProductBySlug(slug);
    if (!p) return null;
    return {
      id: p.slug,
      name: p.name,
      slug: p.slug,
      short_description: p.shortDescription,
      description: p.description,
      price: p.price,
      compare_at_price: p.compareAtPrice ?? null,
      main_image_url: p.image,
      gallery_images: p.gallery,
      status: "active",
      is_featured: true,
      is_bestseller: false,
      protein_percent: p.proteinPercent ?? null,
      hazelnut_percent: p.hazelnutPercent ?? null,
      flavor: p.flavor,
      highlights: p.highlights,
      nutrition_per_100g: p.nutritionPer100g,
      category_id: null,
      weight: p.weightGrams ?? null,
    };
  }
  return data as DbProduct;
}
