import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID!;
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY!;
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email, fullName, phone, address, city, postalCode,
      lines, total, orderId,
    } = body;

    const userIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const basketItems = lines.map((l: { name: string; price: number; quantity: number }) => [
      l.name, String(Math.round(l.price * 100)), l.quantity,
    ]);
    const basketJson = btoa(JSON.stringify(basketItems));
    const paymentAmount = Math.round(total * 100); // kuruş
    const currency = "TL";
    const noInstallment = 0;
    const maxInstallment = 0;
    const testMode = process.env.NODE_ENV === "production" ? 0 : 1;
    const timeoutLimit = 30;
    const debugOn = 0;

    const hashStr = `${PAYTR_MERCHANT_ID}${userIp}${orderId}${email}${paymentAmount}${currency}${noInstallment}${maxInstallment}${testMode}${PAYTR_MERCHANT_SALT}`;
    const token = crypto.createHmac("sha256", PAYTR_MERCHANT_KEY).update(hashStr).digest("base64");

    const params = new URLSearchParams({
      merchant_id: PAYTR_MERCHANT_ID,
      user_ip: userIp,
      merchant_oid: orderId,
      email,
      payment_amount: String(paymentAmount),
      paytr_token: token,
      user_basket: basketJson,
      debug_on: String(debugOn),
      no_installment: String(noInstallment),
      max_installment: String(maxInstallment),
      user_name: fullName,
      user_address: `${address}, ${postalCode} ${city}`,
      user_phone: phone,
      merchant_ok_url: `${process.env.NEXT_PUBLIC_SITE_URL}/siparis-basarili`,
      merchant_fail_url: `${process.env.NEXT_PUBLIC_SITE_URL}/odeme?hata=1`,
      timeout_limit: String(timeoutLimit),
      currency,
      test_mode: String(testMode),
      lang: "tr",
    });

    const response = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method: "POST",
      body: params,
    });

    const data = await response.json();

    if (data.status === "success") {
      return NextResponse.json({ token: data.token });
    } else {
      return NextResponse.json({ error: data.reason || "PayTR hatası" }, { status: 400 });
    }
  } catch (err) {
    console.error("PayTR token error:", err);
    return NextResponse.json({ error: "Ödeme başlatılamadı" }, { status: 500 });
  }
}
