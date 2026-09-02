import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: true, skipped: true });

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { email, fullName, orderId, lines, total } = await req.json();

    const itemsHtml = lines.map((l: { name: string; quantity: number; price: number }) =>
      `<tr><td style="padding:8px 0;border-bottom:1px solid #f0e8e0;">${l.name}</td>
       <td style="padding:8px 0;border-bottom:1px solid #f0e8e0;text-align:center;">${l.quantity}</td>
       <td style="padding:8px 0;border-bottom:1px solid #f0e8e0;text-align:right;">&#8378;${(l.price * l.quantity).toFixed(2).replace(".", ",")}</td></tr>`
    ).join("");

    const { error } = await resend.emails.send({
      from: "Venti-Ate <siparis@venti-ate.com>",
      to: email,
      subject: `Siparişiniz Alındı — ${orderId}`,
      html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#FFF6F0;padding:32px;">
        <h1 style="font-size:24px;color:#56312D;">Merhaba ${fullName},</h1>
        <p style="color:#56312D;">Siparişiniz alındı. Numara: <strong>${orderId}</strong></p>
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:#56312D;color:#FFF6F0;">
            <th style="padding:10px;text-align:left;">Ürün</th>
            <th style="padding:10px;text-align:center;">Adet</th>
            <th style="padding:10px;text-align:right;">Tutar</th>
          </tr></thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot><tr>
            <td colspan="2" style="padding:12px 0;font-weight:bold;color:#56312D;">Toplam</td>
            <td style="padding:12px 0;font-weight:bold;text-align:right;color:#415D1F;">&#8378;${total.toFixed(2).replace(".", ",")}</td>
          </tr></tfoot>
        </table>
        <p style="margin:24px 0 0;color:#56312D;font-size:14px;">Fındığın rafine hali — <strong>Venti-Ate</strong></p>
      </div>`,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Email error:", err);
    return NextResponse.json({ error: "E-posta gönderilemedi" }, { status: 500 });
  }
}
