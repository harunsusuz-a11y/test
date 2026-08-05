"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare } from "lucide-react";

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
    if (filter === "answered") q = q.not("answer", "is", null);
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

  const card: React.CSSProperties = { background:"#1a1a1f", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:18, marginBottom:12 };
  const btn: React.CSSProperties = { padding:"5px 12px", borderRadius:6, border:"none", fontSize:12, cursor:"pointer", fontWeight:600 };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <MessageSquare size={22} color="#c8a26b" />
          <span style={{ fontSize:22, fontWeight:700, color:"#f2f2f3" }}>Soru-Cevap Yönetimi</span>
        </div>
        <span style={{ fontSize:13, color:"#6b6b76" }}>{questions.length} soru</span>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {(["all","pending","answered"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding:"6px 16px", borderRadius:6, cursor:"pointer", fontSize:13,
              border: filter===f ? "1px solid #c8a26b":"1px solid rgba(255,255,255,0.1)",
              background: filter===f ? "rgba(200,162,107,0.1)":"transparent",
              color: filter===f ? "#c8a26b":"#9b9ba4" }}>
            {f==="all"?"Tümü":f==="pending"?"Yanıt Bekliyor":"Yanıtlananlar"}
          </button>
        ))}
      </div>

      {loading ? <p style={{ color:"#6b6b76" }}>Yükleniyor…</p> :
        questions.length === 0 ? (
          <p style={{ color:"#6b6b76", textAlign:"center", padding:"40px 0" }}>Soru bulunamadı.</p>
        ) : questions.map(q => (
          <div key={q.id} style={card}>
            <div style={{ fontSize:12, color:"#6b6b76", marginBottom:8 }}>
              <span>{q.products?.name ?? "Ürün"}</span>
              {" · "}
              <span>{q.profiles ? `${q.profiles.first_name} ${q.profiles.last_name}` : "Misafir"}</span>
              {" · "}
              <span>{new Date(q.created_at).toLocaleDateString("tr-TR")}</span>
              {" · "}
              <span style={{ color: q.status === "published" ? "#4ade80":"#f87171" }}>
                {q.status === "published" ? "Yayında":"Gizli"}
              </span>
            </div>
            <div style={{ fontSize:14, color:"#f2f2f3", marginBottom:10, fontWeight:600 }}>❓ {q.question}</div>
            {q.answer && (
              <div style={{ fontSize:13, color:"#9b9ba4", background:"rgba(255,255,255,0.04)", padding:10, borderRadius:6, marginBottom:10 }}>
                💬 {q.answer}
              </div>
            )}

            {answering === q.id && (
              <div>
                <textarea
                  style={{ width:"100%", background:"#151518", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, color:"#f2f2f3", fontSize:13, padding:10, marginTop:8, resize:"vertical", boxSizing:"border-box" }}
                  rows={3} value={answerText}
                  onChange={e => setAnswerText(e.target.value)}
                  placeholder="Yanıtınızı yazın…"
                />
                <div style={{ display:"flex", gap:8, marginTop:8 }}>
                  <button style={{ ...btn, background:"#c8a26b", color:"#000" }} onClick={() => submitAnswer(q.id)}>Yayınla</button>
                  <button style={{ ...btn, background:"rgba(255,255,255,0.05)", color:"#9b9ba4" }} onClick={() => { setAnswering(null); setAnswerText(""); }}>İptal</button>
                </div>
              </div>
            )}

            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              {!q.answer && answering !== q.id && (
                <button style={{ ...btn, background:"#c8a26b", color:"#000" }} onClick={() => { setAnswering(q.id); setAnswerText(""); }}>Yanıtla</button>
              )}
              <button style={{ ...btn, background:"rgba(255,255,255,0.05)", color:"#9b9ba4" }} onClick={() => togglePublish(q.id, q.status)}>
                {q.status === "published" ? "Gizle":"Yayınla"}
              </button>
              <button style={{ ...btn, background:"rgba(248,113,113,0.1)", color:"#f87171" }} onClick={() => deleteQuestion(q.id)}>Sil</button>
            </div>
          </div>
        ))}
    </div>
  );
}
