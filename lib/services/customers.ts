import { createClient } from "@/lib/supabase/server";

export async function getCustomers({ page = 1, limit = 20, search = "", status = "" } = {}) {
  const supabase = await createClient();
  let query = supabase.from("profiles")
    .select("*, customer_groups(name)", { count: "exact" })
    .in("user_type", ["customer"])
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (search) query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
  if (status) query = query.eq("status", status);
  return query;
}

export async function getCustomerOrders(profileId: string) {
  const supabase = await createClient();
  return supabase.from("orders").select("*")
    .eq("user_id", profileId)
    .order("created_at", { ascending: false });
}
