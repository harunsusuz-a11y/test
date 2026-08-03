"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Zap, Plus, Trash2, ToggleLeft, ToggleRight, CheckCircle, XCircle } from "lucide-react";

type Webhook = { id:string; name:string; url:string; events:string[]; is_active:boolean; created_at:string };
type Log = { id:string; event:string; success:boolean; response_status:number|null; duration_ms:number|null; created_at:string };

const ALL_EVENTS = ["order.placed","order.shipped","order.delivered","order.cancelled","payment.success","payment.failed","product.created","product.updated","review.created"];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:"", url:"", events:[] as string[] });
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<string|null>(null);
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data } = await supabase.from("webhooks").select("*").order("created_at", { ascending:false });
    setWebhooks((data ?? []) as Webhook[]);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function loadLogs(webhookId: string) {
    setSelected(webhookId);
    const { data } = await supabase.from("webhook_logs").select("*").eq("webhook_id", webhookId).order("created_at", { ascending:false }).limit(20);
    setLogs((data ?? []) as Log[]);
  }

  async function create() {
    if (!form.name || !form.url || form.events.length === 0) return;
    setSaving(true);
    await supabase.from("webhooks").insert({ name:form.name, url:form.url, events:form.events, is_active:true });
    setForm({ name:"", url:"", events:[] }); setShowForm(false); setSaving(false); load();
  }

  async function toggle(id: string, current: boolean) {
    await supabase.from("webhooks").update({ is_active:!current }).eq("id", id);
    load();
  }

  async function del(id: string) {
    if (!confirm("Webhook silinsin mi?")) return;
    await supabase.from("webhooks").delete().eq("id", id);
    if (selected === id) { setSelected(null); setLogs([]); }
    load();
  }

  const inputStyle: React.CSSProperties = { width:"100%", background:"#151518", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, color:"#f2f2f3", fontSize:13, padding:"8px 12px", boxSizing:"border-box" };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Zap size={22} color="#c8a26b" />
          <span style={{ fontSize:22, fontWeight:700, color:"#f2f2f3" }}>Webhook Yönetimi</span>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, background:"#c8a26b", border:"none", color:"#000", cursor:"pointer", fontWeight:700, fontSize:13 }}>
          <Plus size={16} /> Webhook Ekle
        </button>
      </div>

      {showForm && (
        <div style={{ background:"#1a1a1f", border:"1px solid rgba(200,162,107,0.3)", borderRadius:10, padding:20, marginBottom:20 }}>
          <p style={{ fontSize:14, fontWeight:600, color:"#f2f2f3", marginBottom:16 }}>Yeni Webhook</p>
          <div style={{ display:"grid", gap:12 }}>
            <div>
              <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:4 }}>Ad</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} placeholder="Webhook adı" />
            </div>
            <div>
              <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:4 }}>URL</label>
              <input style={inputStyle} value={form.url} onChange={e => setForm(f => ({...f, url:e.target.value}))} placeholder="https://example.com/webhook" />
            </div>
            <div>
              <label style={{ fontSize:12, color:"#6b6b76", display:"block", marginBottom:8 }}>Olaylar</label>
              <div style={{ display:"flex", flexWrap:"wrap" as "wrap", gap:8 }}>
                {ALL_EVENTS.map(ev => (
                  <label key={ev} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
                    <input type="checkbox" checked={form.events.includes(ev)}
                      onChange={e => setForm(f => ({ ...f, events: e.target.checked ? [...f.events,ev] : f.events.filter(x=>x!==ev) }))} />
                    <span style={{ fontSize:12, color:"#9b9ba4" }}>{ev}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={create} disabled={saving}
                style={{ padding:"8px 20px", borderRadius:6, background:"#c8a26b", border:"none", color:"#000", cursor:"pointer", fontWeight:700, fontSize:13 }}>
                {saving ? "…" : "Kaydet"}
              </button>
              <button onClick={() => setShowForm(false)}
                style={{ padding:"8px 16px", borderRadius:6, background:"transparent", border:"1px solid rgba(255,255,255,0.1)", color:"#9b9ba4", cursor:"pointer", fontSize:13 }}>
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div>
          {webhooks.length === 0 ? (
            <p style={{ color:"#6b6b76", textAlign:"center", padding:"40px 0" }}>Webhook yok.</p>
          ) : webhooks.map(w => (
            <div key={w.id} onClick={() => loadLogs(w.id)}
              style={{ background: selected===w.id ? "rgba(200,162,107,0.05)" : "#1a1a1f",
                border: `1px solid ${selected===w.id ? "rgba(200,162,107,0.3)":"rgba(255,255,255,0.08)"}`,
                borderRadius:10, padding:16, marginBottom:12, cursor:"pointer", transition:"all .2s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <p style={{ fontSize:14, fontWeight:600, color:"#f2f2f3", margin:"0 0 4px" }}>{w.name}</p>
                  <p style={{ fontSize:12, color:"#6b6b76", margin:"0 0 8px", wordBreak:"break-all" as "break-all" }}>{w.url}</p>
                  <div style={{ display:"flex", flexWrap:"wrap" as "wrap", gap:4 }}>
                    {w.events.map(ev => (
                      <code key={ev} style={{ fontSize:10, background:"rgba(255,255,255,0.05)", padding:"2px 6px", borderRadius:3, color:"#9b9ba4" }}>{ev}</code>
                    ))}
                  </div>
                </div>
                <div style={{ display:"flex", gap:6, flexShrink:0, marginLeft:12 }}>
                  <button onClick={e => { e.stopPropagation(); toggle(w.id, w.is_active); }}
                    style={{ background:"transparent", border:"none", cursor:"pointer", color: w.is_active ? "#4ade80":"#6b6b76", padding:4 }}>
                    {w.is_active ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}
                  </button>
                  <button onClick={e => { e.stopPropagation(); del(w.id); }}
                    style={{ background:"rgba(248,113,113,0.1)", border:"none", borderRadius:6, padding:"4px 8px", color:"#f87171", cursor:"pointer" }}>
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Log Paneli */}
        <div style={{ background:"#1a1a1f", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:16 }}>
          <p style={{ fontSize:14, fontWeight:600, color:"#f2f2f3", marginBottom:12 }}>
            {selected ? "Webhook Logları" : "Bir webhook seçin"}
          </p>
          {logs.length === 0 && selected && <p style={{ color:"#6b6b76", fontSize:13 }}>Log bulunamadı.</p>}
          {logs.map(l => (
            <div key={l.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              {l.success ? <CheckCircle size={14} color="#4ade80"/> : <XCircle size={14} color="#f87171"/>}
              <div style={{ flex:1 }}>
                <span style={{ fontSize:12, color:"#f2f2f3" }}>{l.event}</span>
                <span style={{ fontSize:11, color:"#6b6b76", marginLeft:8 }}>{l.response_status} · {l.duration_ms}ms</span>
              </div>
              <span style={{ fontSize:11, color:"#6b6b76" }}>{new Date(l.created_at).toLocaleTimeString("tr-TR")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
