import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req: Request) => {
  const { event, payload } = await req.json();
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Aktif webhook'ları bul
  const { data: webhooks } = await supabase.from("webhooks")
    .select("*").eq("is_active", true).contains("events", [event]);

  if (!webhooks || webhooks.length === 0) return new Response("No webhooks", { status: 200 });

  // Her webhook'a gönder
  const results = await Promise.allSettled(
    webhooks.map(async (wh: { id: string; url: string; secret?: string }) => {
      const start = Date.now();
      const body = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
      
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (wh.secret) {
        // HMAC-SHA256 imzası
        const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(wh.secret), { name:"HMAC", hash:"SHA-256" }, false, ["sign"]);
        const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
        headers["X-Webhook-Signature"] = btoa(String.fromCharCode(...new Uint8Array(sig)));
      }

      let status = 0; let responseBody = "";
      try {
        const res = await fetch(wh.url, { method:"POST", headers, body, signal: AbortSignal.timeout(10000) });
        status = res.status; responseBody = await res.text();
      } catch (e) { responseBody = String(e); }

      await supabase.from("webhook_logs").insert({
        webhook_id: wh.id, event, payload,
        response_status: status, response_body: responseBody,
        duration_ms: Date.now() - start, success: status >= 200 && status < 300,
      });
    })
  );

  return new Response(JSON.stringify({ processed: results.length }), { headers: { "Content-Type": "application/json" } });
});
