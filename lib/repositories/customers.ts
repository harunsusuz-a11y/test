import { createClient } from "@/lib/supabase/server";

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  group_id?: string;
}

export async function findCustomers(filters: CustomerFilters = {}) {
  const supabase = await createClient();
  const { page=1, limit=20, search, status, group_id } = filters;

  let q = supabase.from("profiles")
    .select("*, customer_groups(name)", { count:"exact" })
    .eq("user_type", "customer")
    .order("created_at", { ascending: false })
    .range((page-1)*limit, page*limit-1);

  if (search)   q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
  if (status)   q = q.eq("status", status);
  if (group_id) q = q.eq("group_id", group_id);

  return q;
}

export async function findCustomerById(id: string) {
  const supabase = await createClient();
  return supabase.from("profiles").select("*, customer_groups(name)").eq("id", id).single();
}

export async function findCustomerOrders(userId: string) {
  const supabase = await createClient();
  return supabase.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false });
}

export async function findCustomerNotes(profileId: string) {
  const supabase = await createClient();
  return supabase.from("customer_notes").select("*, profiles(first_name,last_name)").eq("profile_id", profileId).order("created_at", { ascending: false });
}
