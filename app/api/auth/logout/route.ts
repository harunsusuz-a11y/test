import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, serverError } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // logout_at güncelle
      await supabase.from("user_login_logs")
        .update({ logout_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .is("logout_at", null)
        .order("created_at", { ascending: false })
        .limit(1);
    }

    await supabase.auth.signOut();
    return ok({ signed_out: true });
  } catch (e) {
    return serverError(e);
  }
}
