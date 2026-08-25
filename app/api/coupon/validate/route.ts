import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { code, order_amount } = await request.json();
  if (!code) return NextResponse.json({ valid: false, error: "Kupon kodu gerekli" });

  const supabase = await createClient();
  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .eq("is_active", true)
    .single();

  if (error || !coupon) return NextResponse.json({ valid: false, error: "Geçersiz kupon kodu" });

  // Süre kontrolü
  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now)
    return NextResponse.json({ valid: false, error: "Kupon henüz aktif değil" });
  if (coupon.ends_at && new Date(coupon.ends_at) < now)
    return NextResponse.json({ valid: false, error: "Kupon süresi dolmuş" });

  // Kullanım limiti
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit)
    return NextResponse.json({ valid: false, error: "Kupon kullanım limiti dolmuş" });

  // Min tutar
  if (coupon.min_order_amount && order_amount < coupon.min_order_amount)
    return NextResponse.json({
      valid: false,
      error: `Minimum sipariş tutarı ${coupon.min_order_amount}₺`,
    });

  const discount_value = Number(coupon.discount_value || coupon.value || 0);
  const discount_type = coupon.discount_type || coupon.type || "percent";

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    discount_type,
    discount_value,
    max_discount: coupon.max_discount ? Number(coupon.max_discount) : null,
  });
}
