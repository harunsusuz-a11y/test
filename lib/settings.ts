import { createClient } from "@/lib/supabase/server";

type SettingValue = string | number | boolean | object | null;

const cache = new Map<string, { value: SettingValue; ts: number }>();
const TTL = 60_000; // 1 dakika cache

export async function getSetting(key: string, fallback: SettingValue = null): Promise<SettingValue> {
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.ts < TTL) return cached.value;

  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .single();

  const value = data?.value ?? fallback;
  cache.set(key, { value, ts: now });
  return value;
}

export async function getSettings(keys: string[]): Promise<Record<string, SettingValue>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", keys);

  const result: Record<string, SettingValue> = {};
  for (const row of data ?? []) {
    result[row.key] = row.value;
  }
  return result;
}
