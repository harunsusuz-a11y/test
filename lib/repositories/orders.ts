import { createClient } from "@/lib/supabase/server";

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  from?: string;
  to?: string;
}

export async function findOrders(filters: OrderFilters = {}) {
  const supabase = await createClient();
  const { page=1, limit=20, status, search, from, to } = filters;

  let q = supabase.from("orders")
    .select("*", { count:"exact" })
    .order("created_at", { ascending: false })
    .range((page-1)*limit, page*limit-1);

  if (status) q = q.eq("status", status);
  if (search)  q = q.or(`order_number.ilike.%${search}%,full_name.ilike.%${search}%,email.ilike.%${search}%`);
  if (from)    q = q.gte("created_at", from);
  if (to)      q = q.lte("created_at", to);

  return q;
}

export async function findOrderById(id: string) {
  const supabase = await createClient();
  return supabase.from("orders").select("*").eq("id", id).single();
}

export async function findOrderItems(orderId: string) {
  const supabase = await createClient();
  return supabase.from("order_items").select("*").eq("order_id", orderId);
}

export async function findOrderStatusHistory(orderId: string) {
  const supabase = await createClient();
  return supabase.from("order_status_history").select("*").eq("order_id", orderId).order("created_at", { ascending: false });
}

export async function updateOrderStatus(id: string, status: string, userId?: string) {
  const supabase = await createClient();
  const [updateResult] = await Promise.all([
    supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id),
    supabase.from("order_status_history").insert({ order_id: id, new_status: status, changed_by: userId ?? null, created_at: new Date().toISOString() }),
  ]);
  return updateResult;
}
