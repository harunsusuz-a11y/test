import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", ["free_shipping_threshold", "standard_shipping_cost"]);

  const map: Record<string, number> = {};
  for (const row of data ?? []) {
    map[row.key] = Number(row.value);
  }

  return NextResponse.json({
    free_shipping_threshold: map["free_shipping_threshold"] ?? 300,
    standard_shipping_cost: map["standard_shipping_cost"] ?? 29.9,
  });
}
