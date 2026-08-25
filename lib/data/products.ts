import { createClient } from "@/lib/supabase/client";

export type DbProduct = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  main_image_url: string | null;
  gallery_images: string[];
  status: string;
  is_featured: boolean;
  is_bestseller: boolean;
  protein_percent: number | null;
  hazelnut_percent: number | null;
  flavor: string | null;
  highlights: string[];
  ingredients: string[];
  nutrition_per_100g: { label: string; value: string }[];
  usage_tips: string[];
  faq: { question: string; answer: string }[];
  attributes: { label: string; value: string }[];
  category_id: string | null;
  weight: number | null;
};

export async function getProducts(): Promise<DbProduct[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id,name,slug,short_description,description,price,compare_at_price,main_image_url,gallery_images,status,is_featured,is_bestseller,protein_percent,hazelnut_percent,flavor,highlights,ingredients,nutrition_per_100g,usage_tips,faq,attributes,category_id,weight")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getProducts error:", error);
    return [];
  }
  return (data ?? []) as DbProduct[];
}

export async function getProductBySlug(slug: string): Promise<DbProduct | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id,name,slug,short_description,description,price,compare_at_price,main_image_url,gallery_images,status,is_featured,is_bestseller,protein_percent,hazelnut_percent,flavor,highlights,ingredients,nutrition_per_100g,usage_tips,faq,attributes,category_id,weight")
    .eq("slug", slug)
    .eq("status", "active")
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return data as DbProduct;
}
