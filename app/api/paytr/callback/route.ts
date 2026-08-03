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

  if (status === "success") {
    await supabase
      .from("orders")
      .update({ status: "confirmed", payment_status: "paid" })
      .eq("order_number", merchantOid);
  } else {
    await supabase
      .from("orders")
      .update({ status: "cancelled", payment_status: "failed" })
      .eq("order_number", merchantOid);
  }

  return new NextResponse("OK");
}
