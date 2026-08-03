import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email, source = "website" } = await req.json();
    if (!email) return NextResponse.json({ error: "E-posta gerekli" }, { status: 400 });

    const supabase = await createClient();
    const { error: dbError } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email, source, status: "active" }, { onConflict: "email" });

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: "Venti-Ate <merhaba@ventiate.com>",
        to: email,
        subject: "Venti Kulübü'ne Hoş Geldin",
        html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#FFF6F0;padding:32px;">
          <h1 style="font-size:22px;color:#56312D;">Venti Kulübü'ne hoş geldin!</h1>
          <p style="color:#56312D;">Yeni aromalara ilk sen erişeceksin.</p>
          <p style="color:#415D1F;font-weight:bold;">— Venti-Ate</p>
        </div>`,
      }).catch(() => null);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Newsletter error:", err);
    return NextResponse.json({ error: "Hata oluştu" }, { status: 500 });
  }
}
