import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req: Request) => {
  const { order_id, event } = await req.json();
  if (!order_id || !event) return new Response("Missing params", { status: 400 });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Sipariş ve şablon al
  const [{ data: order }, { data: template }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", order_id).single(),
    supabase.from("notification_templates").select("*").eq("event", event).single(),
  ]);

  if (!order || !template) return new Response("Order or template not found", { status: 404 });

  // Değişkenleri doldur
  let html = template.body_html ?? template.body ?? "";
  html = html.replace(/{{customer_name}}/g, order.full_name ?? "Müşteri");
  html = html.replace(/{{order_number}}/g, order.order_number ?? "");
  html = html.replace(/{{order_total}}/g, `₺${Number(order.total).toFixed(2)}`);
  html = html.replace(/{{tracking_number}}/g, order.tracking_number ?? "-");

  // Resend ile gönder
  if (!RESEND_API_KEY) return new Response("RESEND_API_KEY not set", { status: 500 });

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Venti-Ate <siparis@ventiate.com>",
      to: order.email,
      subject: (template.subject ?? "Bildirim").replace(/{{order_number}}/g, order.order_number),
      html,
    }),
  });

  if (!emailRes.ok) {
    const err = await emailRes.text();
    return new Response(`Email error: ${err}`, { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
});
