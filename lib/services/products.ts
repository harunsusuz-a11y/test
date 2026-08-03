import { createClient } from "@/lib/supabase/server";
import type { ProductFormValues } from "@/lib/validations/product";

export async function getProducts({ page = 1, limit = 20, search = "", status = "" } = {}) {
  const supabase = await createClient();
  let query = supabase.from("products").select("*, categories(name)", { count: "exact" })
    .is("deleted_at", null).order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (search) query = query.ilike("name", `%${search}%`);
  if (status) query = query.eq("status", status);
  return query;
}

export async function createProduct(data: ProductFormValues, userId: string) {
  const supabase = await createClient();
  return supabase.from("products").insert({ ...data, created_by: userId }).select().single();
}

export async function updateProduct(id: string, data: Partial<ProductFormValues>, userId: string) {
  const supabase = await createClient();
  return supabase.from("products").update({ ...data, updated_at: new Date().toISOString(), updated_by: userId }).eq("id", id).select().single();
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  return supabase.from("products").update({ deleted_at: new Date().toISOString() }).eq("id", id);
}
