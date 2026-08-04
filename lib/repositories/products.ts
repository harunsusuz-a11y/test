import { createClient } from "@/lib/supabase/server";

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category_id?: string;
  is_featured?: boolean;
}

export async function findProducts(filters: ProductFilters = {}) {
  const supabase = await createClient();
  const { page=1, limit=20, search, status, category_id, is_featured } = filters;

  let q = supabase.from("products")
    .select("id, name, slug, price, compare_at_price, status, is_featured, is_bestseller, main_image_url, created_at, categories(name)", { count:"exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range((page-1)*limit, page*limit-1);

  if (search)      q = q.ilike("name", `%${search}%`);
  if (status)      q = q.eq("status", status);
  if (category_id) q = q.eq("category_id", category_id);
  if (is_featured !== undefined) q = q.eq("is_featured", is_featured);

  return q;
}

export async function findProductById(id: string) {
  const supabase = await createClient();
  return supabase.from("products").select("*, categories(name, slug), brands(name)").eq("id", id).single();
}

export async function findProductVariants(productId: string) {
  const supabase = await createClient();
  return supabase.from("product_variants").select("*").eq("product_id", productId).order("created_at");
}

export async function createProduct(data: Record<string, unknown>, userId: string) {
  const supabase = await createClient();
  return supabase.from("products").insert({ ...data, created_by: userId }).select().single();
}

export async function updateProduct(id: string, data: Record<string, unknown>, userId: string) {
  const supabase = await createClient();
  return supabase.from("products")
    .update({ ...data, updated_at: new Date().toISOString(), updated_by: userId })
    .eq("id", id).select().single();
}

export async function softDeleteProduct(id: string) {
  const supabase = await createClient();
  return supabase.from("products").update({ deleted_at: new Date().toISOString() }).eq("id", id);
}
