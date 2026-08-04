import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Cron: saatte bir çalışır — terk edilmiş sepetleri tespit eder
serve(async (_req: Request) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const cutoff = new Date(Date.now() - 3600000).toISOString(); // 1 saat önce

  // Son 1 saatte güncellenmemiş, reminder gönderilmemiş sepetler
  const { data: carts } = await supabase.from("carts")
    .select("id, user_id, updated_at")
    .lt("updated_at", cutoff)
    .not("user_id", "is", null);

  let processed = 0;
  for (const cart of carts ?? []) {
    // Kullanıcı e-postasını al
    const { data: profile } = await supabase.from("profiles").select("email, first_name").eq("id", cart.user_id).single();
    if (!profile) continue;

    // Terk edilmiş sepet kaydı
    await supabase.from("abandoned_carts").upsert({
      cart_id: cart.id, user_id: cart.user_id, email: profile.email,
      reminder_sent: false, created_at: new Date().toISOString(),
    }, { onConflict: "cart_id" });

    processed++;
  }

  return new Response(JSON.stringify({ processed }), { headers: { "Content-Type": "application/json" } });
});
