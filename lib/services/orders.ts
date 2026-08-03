import { createClient } from "@/lib/supabase/server";

export async function getOrders({ page = 1, limit = 20, status = "", search = "" } = {}) {
  const supabase = await createClient();
  let query = supabase.from("orders").select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (status) query = query.eq("status", status);
  if (search) query = query.or(`order_number.ilike.%${search}%,full_name.ilike.%${search}%,email.ilike.%${search}%`);
  return query;
}

export async function updateOrderStatus(id: string, status: string, userId: string, trackingNumber?: string, note?: string) {
  const supabase = await createClient();
  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (trackingNumber) updates.tracking_number = trackingNumber;
  if (note) updates.admin_note = note;
  
  const result = await supabase.from("orders").update(updates).eq("id", id);
  
  // Durum geçmişi ekle
  await supabase.from("order_status_history").insert({
    order_id: id, new_status: status, changed_by: userId, created_at: new Date().toISOString()
  });
  
  return result;
}
