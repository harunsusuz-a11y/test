"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, Check, Trash2, CheckCheck } from "lucide-react";

type Notif = { id:string; title:string; message:string; type:string; is_read:boolean; created_at:string; link?:string };

export default function BildirimlerPage() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all"|"unread">("all");
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("notifications").select("*").order("created_at", { ascending:false }).limit(50);
    if (filter === "unread") q = q.eq("is_read", false);
    const { data } = await q;
    setNotifs((data ?? []) as Notif[]);
    setLoading(false);
  }, [supabase, filter]);

  useEffect(() => { load(); }, [load]);

  async function markRead(id: string) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    load();
  }

  async function markAllRead() {
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    load();
  }

  async function deleteNotif(id: string) {
    await supabase.from("notifications").delete().eq("id", id);
    load();
  }

  const TYPE_COLORS: Record<string,string> = {
    order:"#c8a26b", stock:"#f87171", system:"#60a5fa", customer:"#4ade80", default:"var(--adm-text-muted)"
  };
  const TYPE_LABELS: Record<string,string> = {
    order:"Sipariş", stock:"Stok", system:"Sistem", customer:"Müşteri"
  };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Bell size={22} color="#c8a26b" />
          <span style={{ fontSize:22, fontWeight:700, color:"var(--adm-text)" }}>Bildirim Merkezi</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {(["all","unread"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:"6px 14px", borderRadius:6, border: filter===f ? "1px solid #c8a26b":"1px solid rgba(255,255,255,0.1)",
                background: filter===f ? "rgba(200,162,107,0.1)":"transparent",
                color: filter===f ? "#c8a26b":"var(--adm-text-muted)", cursor:"pointer", fontSize:13 }}>
              {f==="all"?"Tümü":"Okunmamış"}
            </button>
          ))}
          <button onClick={markAllRead}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:6, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"var(--adm-text-muted)", cursor:"pointer", fontSize:13 }}>
            <CheckCheck size={14} /> Tümünü Oku
          </button>
        </div>
      </div>

      {loading ? <p style={{ color:"var(--adm-text-muted)" }}>Yükleniyor…</p> :
        notifs.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <Bell size={40} color="#3a3a45" style={{ margin:"0 auto 16px" }} />
            <p style={{ color:"var(--adm-text-muted)" }}>Bildirim yok</p>
          </div>
        ) : notifs.map(n => (
          <div key={n.id} style={{
            background: n.is_read ? "var(--adm-surface)" : "rgba(200,162,107,0.05)",
            border: `1px solid ${n.is_read ? "var(--adm-border)" : "rgba(200,162,107,0.2)"}`,
            borderRadius:10, padding:16, marginBottom:10,
            display:"flex", alignItems:"flex-start", gap:12
          }}>
            <div style={{
              width:10, height:10, borderRadius:"50%", marginTop:5, flexShrink:0,
              background: TYPE_COLORS[n.type] ?? TYPE_COLORS.default
            }} />
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:13, fontWeight:600, color:"var(--adm-text)" }}>{n.title}</span>
                <span style={{ fontSize:11, color:"var(--adm-text-muted)" }}>{new Date(n.created_at).toLocaleString("tr-TR")}</span>
              </div>
              <p style={{ fontSize:13, color:"var(--adm-text-muted)", margin:0 }}>{n.message}</p>
              <span style={{ fontSize:11, color: TYPE_COLORS[n.type]??TYPE_COLORS.default, marginTop:6, display:"block" }}>
                {TYPE_LABELS[n.type] ?? n.type}
              </span>
            </div>
            <div style={{ display:"flex", gap:6, flexShrink:0 }}>
              {!n.is_read && (
                <button onClick={() => markRead(n.id)}
                  style={{ background:"rgba(74,222,128,0.1)", border:"none", borderRadius:6, padding:"5px 10px", color:"#4ade80", cursor:"pointer", fontSize:12 }}>
                  <Check size={14} />
                </button>
              )}
              <button onClick={() => deleteNotif(n.id)}
                style={{ background:"rgba(248,113,113,0.1)", border:"none", borderRadius:6, padding:"5px 10px", color:"#f87171", cursor:"pointer" }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
