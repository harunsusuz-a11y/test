import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY!;
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const merchantOid = formData.get("merchant_oid") as string;
  const status = formData.get("status") as string;
  const totalAmount = formData.get("total_amount") as string;
  const hash = formData.get("hash") as string;

  // Hash doğrulama
  const hashStr = `${merchantOid}${PAYTR_MERCHANT_SALT}${status}${totalAmount}`;
  const expectedHash = crypto
    .createHmac("sha256", PAYTR_MERCHANT_KEY)
    .update(hashStr)
    .digest("base64");

  if (hash !== expectedHash) {
    return new NextResponse("PAYTR_INVALID_HASH", { status: 400 });
  }

  const supabase = await createClient();

  const orderStatus = status === "success" ? "confirmed" : "cancelled";
  const paymentStatus = status === "success" ? "paid" : "failed";

  await supabase
    .from("orders")
    .update({ status: orderStatus, payment_status: paymentStatus })
    .eq("order_number", merchantOid);

  // Sipariş onay maili (sadece başarılıda)
  if (status === "success") {
    const { data: order } = await supabase
      .from("orders")
      .select("email, full_name, total")
      .eq("order_number", merchantOid)
      .single();
    
    if (order) {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/order-confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: order.email,
          fullName: order.full_name,
          orderId: merchantOid,
          lines: [],
          total: order.total,
        }),
      }).catch(() => null);
    }
  }

  return new NextResponse("OK");
}
