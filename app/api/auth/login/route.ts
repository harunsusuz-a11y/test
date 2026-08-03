import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, err, serverError } from "@/lib/api/response";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  if (!checkRateLimit(`login:${ip}`, 5, 60000)) {
    return err("RATE_LIMITED", "Çok fazla giriş denemesi. 1 dakika bekleyin.", 429);
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return err("VALIDATION_ERROR", "Geçersiz form verisi.", 400);

  const { email, password } = parsed.data;
  const supabase = await createClient();
  const userAgent = req.headers.get("user-agent") ?? "";

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    // Login log
    try {
      await supabase.from("user_login_logs").insert({
        email,
        user_id: data.user?.id ?? null,
        user_type: "admin",
        login_at: new Date().toISOString(),
        ip_address: ip,
        user_agent: userAgent,
        login_status: error ? "failed" : "success",
        failure_reason: error?.message ?? null,
        auth_provider: "email",
      });
    } catch { /* log hatası login'i engellemesin */ }

    if (error) {
      try {
        await supabase.from("security_events").insert({
          event_type: "login_failed",
          severity: "warning",
          ip_address: ip,
          user_agent: userAgent,
          details: { email, reason: error.message },
        });
      } catch { /* sessiz hata */ }

      return err("AUTH_FAILED", "E-posta veya şifre hatalı.", 401);
    }

    return ok({ user: data.user });
  } catch (e) {
    return serverError(e);
  }
}
