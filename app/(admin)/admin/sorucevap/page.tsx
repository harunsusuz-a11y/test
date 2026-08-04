"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, Check, X, Eye } from "lucide-react";

type Question = {
  id: string; product_id: string; question: string; answer: string | null;
  status: string; created_at: string;
  profiles?: { first_name: string; last_name: string; email: string } | null;
  products?: { name: string } | null;
};

export default function SoruCevapPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all"|"pending"|"answered">("all");
  const [answering, setAnswering] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("product_questions")
      .select("*, profiles(first_name,last_name,email), products(name)")
      .order("created_at", { ascending: false });
    if (filter === "pending") q = q.is("answer", null);
    if (filter === "answered") q = q.not("answer","is",null);
    const { data } = await q;
    setQuestions((data ?? []) as Question[]);
    setLoading(false);
  }, [supabase, filter]);

  useEffect(() => { load(); }, [load]);

  async function submitAnswer(id: string) {
    if (!answerText.trim()) return;
    await supabase.from("product_questions").update({ answer: answerText, status: "published" }).eq("id", id);
    setAnswering(null); setAnswerText(""); load();
  }

  async function togglePublish(id: string, current: string) {
    await supabase.from("product_questions").update({ status: current === "published" ? "pending" : "published" }).eq("id", id);
    load();
  }

  async function deleteQuestion(id: string) {
    if (!confirm("Soruyu sil?")) return;
    await supabase.from("product_questions").delete().eq("id", id);
    load();
  }

  const s: Record<string, string> = {
    container: "padding:24px", header: "display:flex;justify-content:space-between;align-items:center;margin-bottom:24px",
    title: "fontSize:22px;fontWeight:700;color:#f2f2f3",
    tabs: "display:flex;gap:8px;marginBottom:20px",
    tab: "padding:6px 16px;borderRadius:6px;border:1px solid rgba(255,255,255,0.1);cursor:pointer;fontSize:13px;color:#9b9ba4",
    tabActive: "padding:6px 16px;borderRadius:6px;border:1px solid #c8a26b;background:rgba(200,162,107,0.1);cursor:pointer;fontSize:13px;color:#c8a26b",
    card: "background:#1a1a1f;border:1px solid rgba(255,255,255,0.08);borderRadius:10px;padding:18px;marginBottom:12px",
    meta: "fontSize:12px;color:#6b6b76;marginBottom:8px",
    question: "fontSize:14px;color:#f2f2f3;marginBottom:10px;fontWeight:600",
    answer: "fontSize:13px;color:#9b9ba4;background:rgba(255,255,255,0.04);padding:10px;borderRadius:6px;marginBottom:10px",
    actions: "display:flex;gap:8px",
    btn: "padding:5px 12px;borderRadius:6px;border:none;fontSize:12px;cursor:pointer;fontWeight:600",
    textarea: "width:100%;background:#151518;border:1px solid rgba(255,255,255,0.1);borderRadius:6px;color:#f2f2f3;fontSize:13px;padding:10px;marginTop:8px;resize:vertical;boxSizing:border-box" as string,
  };

  return (
    <div style={s.container as React.CSSProperties}>
      <div style={s.header as React.CSSProperties}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <MessageSquare size={22} color="#c8a26b" />
          <span style={s.title as React.CSSProperties}>Soru-Cevap Yönetimi</span>
        </div>
        <span style={{ fontSize:13, color:"#6b6b76" }}>{questions.length} soru</span>
      </div>

      <div style={s.tabs as React.CSSProperties}>
        {(["all","pending","answered"] as const).map(f => (
          <button key={f} style={(filter===f ? s.tabActive : s.tab) as React.CSSProperties} onClick={() => setFilter(f)}>
            {f==="all"?"Tümü":f==="pending"?"Yanıt Bekliyor":"Yanıtlananlar"}
          </button>
        ))}
      </div>

      {loading ? <p style={{ color:"#6b6b76" }}>Yükleniyor…</p> : questions.length === 0 ? (
        <p style={{ color:"#6b6b76", textAlign:"center", padding:"40px 0" }}>Soru bulunamadı.</p>
      ) : questions.map(q => (
        <div key={q.id} style={s.card as React.CSSProperties}>
          <div style={s.meta as React.CSSProperties}>
            <span>{q.products?.name ?? "Ürün"}</span>
            {" · "}
            <span>{q.profiles ? `${q.profiles.first_name} ${q.profiles.last_name}` : "Misafir"}</span>
            {" · "}
            <span>{new Date(q.created_at).toLocaleDateString("tr-TR")}</span>
            {" · "}
            <span style={{ color: q.status === "published" ? "#4ade80" : "#f87171" }}>
              {q.status === "published" ? "Yayında" : "Gizli"}
            </span>
          </div>
          <div style={s.question as React.CSSProperties}>❓ {q.question}</div>
          {q.answer && <div style={s.answer as React.CSSProperties}>💬 {q.answer}</div>}

          {answering === q.id && (
            <div>
              <textarea
                style={s.textarea as React.CSSProperties}
                rows={3} value={answerText}
                onChange={e => setAnswerText(e.target.value)}
                placeholder="Yanıtınızı yazın…"
              />
              <div style={{ display:"flex", gap:8, marginTop:8 }}>
                <button style={{ ...s.btn as React.CSSProperties, background:"#c8a26b", color:"#000" } as React.CSSProperties}
                  onClick={() => submitAnswer(q.id)}>Yayınla</button>
                <button style={{ ...s.btn as React.CSSProperties, background:"rgba(255,255,255,0.05)", color:"#9b9ba4" } as React.CSSProperties}
                  onClick={() => { setAnswering(null); setAnswerText(""); }}>İptal</button>
              </div>
            </div>
          )}

          <div style={s.actions as React.CSSProperties}>
            {!q.answer && answering !== q.id && (
              <button style={{ ...s.btn as React.CSSProperties, background:"#c8a26b", color:"#000" } as React.CSSProperties}
                onClick={() => { setAnswering(q.id); setAnswerText(""); }}>Yanıtla</button>
            )}
            <button style={{ ...s.btn as React.CSSProperties, background:"rgba(255,255,255,0.05)", color:"#9b9ba4" } as React.CSSProperties}
              onClick={() => togglePublish(q.id, q.status)}>
              {q.status === "published" ? "Gizle" : "Yayınla"}
            </button>
            <button style={{ ...s.btn as React.CSSProperties, background:"rgba(248,113,113,0.1)", color:"#f87171" } as React.CSSProperties}
              onClick={() => deleteQuestion(q.id)}>Sil</button>
          </div>
        </div>
      ))}
    </div>
  );
}
