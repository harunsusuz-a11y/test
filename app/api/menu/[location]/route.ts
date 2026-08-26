import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ location: string }> }
) {
  const { location } = await params;
  const supabase = await createClient();

  const { data: menu } = await supabase
    .from("menus")
    .select("id")
    .eq("location", location)
    .eq("is_active", true)
    .single();

  if (!menu) return NextResponse.json([]);

  const { data: items } = await supabase
    .from("menu_items")
    .select("id, label, url, target, icon, sort_order, parent_id")
    .eq("menu_id", menu.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return NextResponse.json(items ?? [], {
    headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
  });
}
