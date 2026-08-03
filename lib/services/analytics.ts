import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats(from: string, to: string) {
  const supabase = await createClient();
  
  const [orders, products, profiles, reviews] = await Promise.all([
    supabase.from("orders").select("status, total, created_at")
      .gte("created_at", from).lte("created_at", to),
    supabase.from("products").select("status, is_featured").is("deleted_at", null),
    supabase.from("profiles").select("status, created_at, user_type")
      .eq("user_type", "customer").gte("created_at", from).lte("created_at", to),
    supabase.from("reviews").select("rating").eq("status", "approved"),
  ]);

  const orderData = orders.data ?? [];
  const totalRevenue = orderData.filter(o => o.status === "delivered").reduce((s, o) => s + Number(o.total), 0);
  const totalOrders = orderData.length;
  const pendingOrders = orderData.filter(o => o.status === "pending").length;
  const cancelledOrders = orderData.filter(o => o.status === "cancelled").length;
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const productData = products.data ?? [];
  const totalProducts = productData.length;
  const activeProducts = productData.filter(p => p.status === "active").length;

  const newCustomers = profiles.data?.length ?? 0;
  const avgRating = reviews.data && reviews.data.length > 0
    ? reviews.data.reduce((s, r) => s + r.rating, 0) / reviews.data.length : 0;

  return {
    totalRevenue, totalOrders, pendingOrders, cancelledOrders, avgOrder,
    totalProducts, activeProducts, newCustomers, avgRating,
  };
}

export async function getSalesChart(from: string, to: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("orders")
    .select("created_at, total, status")
    .gte("created_at", from).lte("created_at", to)
    .order("created_at");
  return data ?? [];
}

export async function getTopProducts(limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase.from("order_items")
    .select("product_id, quantity, unit_price, products(name, main_image_url)")
    .order("quantity", { ascending: false })
    .limit(limit);
  return data ?? [];
}
