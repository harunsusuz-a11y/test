import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keys = searchParams.get("keys")?.split(",").filter(Boolean) ?? [];
  if (!keys.length) return NextResponse.json({});

  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", keys);

  const result: Record<string, unknown> = {};
  for (const row of data ?? []) result[row.key] = row.value;
  return NextResponse.json(result, {
    headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
  });
}
