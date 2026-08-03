import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || "prj_272E6lymaJWGoCviv5sSJZHLS6c5";
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || "team_07ztwKF1hVHZsFkAW2nA209L";

// Sadece admin erişebilir
async function isAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("profiles")
    .select("user_type").eq("id", user.id).single();
  return data?.user_type === "admin" || data?.user_type === "super_admin";
}

// GET: mevcut env listesi (sadece key'ler, value masked)
export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!VERCEL_TOKEN) return NextResponse.json({ error: "VERCEL_TOKEN eksik" }, { status: 500 });

  const res = await fetch(
    `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env?teamId=${VERCEL_TEAM_ID}`,
    { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
  );
  const data = await res.json();
  // Sadece key ve type döndür, value'yu maskeliyoruz
  const envs = (data.envs ?? []).map((e: { key: string; type: string; id: string }) => ({
    id: e.id, key: e.key, type: e.type,
  }));
  return NextResponse.json({ envs });
}

// POST: env ekle veya güncelle
export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!VERCEL_TOKEN) return NextResponse.json({ error: "VERCEL_TOKEN eksik" }, { status: 500 });

  const { key, value } = await req.json();
  if (!key || !value) return NextResponse.json({ error: "key ve value gerekli" }, { status: 400 });

  // Mevcut env varsa sil, sonra ekle
  const listRes = await fetch(
    `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env?teamId=${VERCEL_TEAM_ID}`,
    { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
  );
  const listData = await listRes.json();
  const existing = (listData.envs ?? []).find((e: { key: string; id: string }) => e.key === key);

  if (existing) {
    await fetch(
      `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env/${existing.id}?teamId=${VERCEL_TEAM_ID}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
    );
  }

  const addRes = await fetch(
    `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env?teamId=${VERCEL_TEAM_ID}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        key, value,
        type: "encrypted",
        target: ["production", "preview"],
      }),
    }
  );

  if (!addRes.ok) {
    const err = await addRes.json();
    return NextResponse.json({ error: err.error?.message || "Vercel hatası" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
