import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Yurtiçi Kargo Entegrasyon API
 * POST /api/kargo/yurtici
 * Body: { order_id: string }
 *
 * Yurtiçi test ortamı: https://customerapi.yurticikargo.com:8085
 * Prod: https://customerapi.yurticikargo.com
 * Dokümantasyon: https://customerapi.yurticikargo.com/api/docs
 */

const YURTICI_BASE_URL = process.env.YURTICI_API_URL ?? "https://customerapi.yurticikargo.com:8085";
const YURTICI_USERNAME = process.env.YURTICI_USERNAME ?? "";
const YURTICI_PASSWORD = process.env.YURTICI_PASSWORD ?? "";
const YURTICI_CUSTOMER_NO = process.env.YURTICI_CUSTOMER_NO ?? "";

async function getYurticiToken(): Promise<string | null> {
  try {
    const res = await fetch(`${YURTICI_BASE_URL}/api/i1/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: YURTICI_USERNAME, password: YURTICI_PASSWORD }),
    });
    const data = await res.json();
    return data?.data?.id ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const { order_id } = await request.json();
  if (!order_id) return NextResponse.json({ error: "order_id gerekli" }, { status: 400 });

  const supabase = await createClient();

  // Siparişi çek
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(product_name, quantity, unit_price)")
    .eq("id", order_id)
    .single();

  if (error || !order) return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });

  // Yurtiçi token al
  const token = await getYurticiToken();
  if (!token) {
    return NextResponse.json({ error: "Yurtiçi bağlantısı kurulamadı" }, { status: 503 });
  }

  // Kargo kaydı oluştur
  const payload = {
    data: [
      {
        merchantCode: YURTICI_CUSTOMER_NO,
        receiverCityCode: 0, // Şehir kodu — adres parse edilmeli
        receiverDistrictCode: 0,
        receiverName: order.full_name,
        receiverAddress: order.address,
        receiverPhone1: order.phone,
        weight: 1,
        barbcode: order.order_number,
        quantity: 1,
        invoiceKey: order.order_number,
        invoiceDate: new Date().toISOString().split("T")[0],
        packageType: 1,
        isCod: order.payment_status === "pending" ? 1 : 0,
        codAmount: order.payment_status === "pending" ? order.total : 0,
      },
    ],
  };

  try {
    const res = await fetch(`${YURTICI_BASE_URL}/api/i1/CreateShipment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    const cargoNo = result?.data?.[0]?.cargoKey ?? null;

    if (cargoNo) {
      // Siparişe takip numarasını yaz
      await supabase
        .from("orders")
        .update({
          tracking_number: cargoNo,
          shipping_company: "Yurtiçi Kargo",
          status: "shipped",
        })
        .eq("id", order_id);

      // Shipments tablosuna da yaz
      const { data: company } = await supabase
        .from("shipping_companies")
        .select("id")
        .eq("code", "yurtici")
        .single();

      await supabase.from("shipments").insert({
        order_id,
        shipping_company_id: company?.id ?? null,
        tracking_number: cargoNo,
        tracking_url: `https://gonderitakip.yurticikargo.com/tracking/TrackByQueryNumber?q=${cargoNo}`,
        status: "shipped",
        shipped_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: !!cargoNo, tracking_number: cargoNo, result });
  } catch (err) {
    return NextResponse.json({ error: "Kargo etiketi oluşturulamadı" }, { status: 500 });
  }
}
