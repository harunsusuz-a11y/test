import { createClient } from "@/lib/supabase/server";

export async function findInventory(warehouseId?: string) {
  const supabase = await createClient();
  let q = supabase.from("inventory")
    .select("*, products(name, slug, status), warehouses(name)")
    .order("quantity", { ascending: true });
  if (warehouseId) q = q.eq("warehouse_id", warehouseId);
  return q;
}

export async function findLowStockItems(threshold = 10) {
  const supabase = await createClient();
  return supabase.from("inventory")
    .select("*, products(name, slug)")
    .lt("quantity", threshold)
    .order("quantity", { ascending: true });
}

export async function findInventoryMovements(productId?: string, limit = 50) {
  const supabase = await createClient();
  let q = supabase.from("inventory_movements")
    .select("*, products(name), warehouses(name), profiles(first_name,last_name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (productId) q = q.eq("product_id", productId);
  return q;
}

export async function adjustInventory(productId: string, warehouseId: string, quantity: number, type: string, userId: string, notes?: string) {
  const supabase = await createClient();

  // Mevcut stoku güncelle
  const { data: inv } = await supabase.from("inventory").select("id, quantity").eq("product_id", productId).eq("warehouse_id", warehouseId).single();

  if (inv) {
    const newQty = type === "in" ? inv.quantity + quantity : Math.max(0, inv.quantity - quantity);
    await supabase.from("inventory").update({ quantity: newQty }).eq("id", inv.id);
  } else {
    await supabase.from("inventory").insert({ product_id: productId, warehouse_id: warehouseId, quantity: type === "in" ? quantity : 0 });
  }

  // Hareket kaydı
  return supabase.from("inventory_movements").insert({
    product_id: productId, warehouse_id: warehouseId,
    movement_type: type, quantity, performed_by: userId, notes: notes ?? null,
    created_at: new Date().toISOString(),
  });
}
