"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, TrendingUp, AlertCircle } from "lucide-react";

export default function AramalarPage() {
  const [topSearches, setTopSearches] = useState<{query:string;count:number}[]>([]);
  const [noResults, setNoResults] = useState<{query:string;count:number}[]>([]);
  const [recent, setRecent] = useState<{query:string;results_count:number;created_at:string}[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase.from("search_logs")
        .select("query,results_count,created_at")
        .order("created_at", { ascending: false })
        .limit(200);

      const all = data ?? [];
      // En çok aranan
      const freq = all.reduce((acc: Record<string,number>, s) => {
        acc[s.query] = (acc[s.query]||0) + 1;
        return acc;
      }, {});
      setTopSearches(Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,10).map(([query,count]) => ({ query, count })));

      // Sonuç bulunamayan
      const noRes = all.filter(s => s.results_count === 0);
      const noResFreq = noRes.reduce((acc: Record<string,number>, s) => {
        acc[s.query] = (acc[s.query]||0) + 1;
        return acc;
      }, {});
      setNoResults(Object.entries(noResFreq).sort((a,b) => b[1]-a[1]).slice(0,10).map(([query,count]) => ({ query, count })));
      
      setRecent(all.slice(0,20));
      setLoading(false);
    }
    load();
  }, [supabase]);

  const cardStyle: React.CSSProperties = { background:"var(--adm-surface)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:20 };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <Search size={22} color="#c8a26b" />
        <span style={{ fontSize:22, fontWeight:700, color:"var(--adm-text)" }}>Arama Yönetimi</span>
      </div>

      {loading ? <p style={{ color:"var(--adm-text-muted)" }}>Yükleniyor…</p> : (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div style={cardStyle}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <TrendingUp size={16} color="#c8a26b" />
              <span style={{ fontSize:15, fontWeight:600, color:"var(--adm-text)" }}>En Çok Arananlar</span>
            </div>
            {topSearches.length === 0 ? <p style={{ color:"var(--adm-text-muted)", fontSize:13 }}>Veri yok</p> :
              topSearches.map((s, i) => (
                <div key={s.query} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:11, color:"var(--adm-text-muted)", width:20 }}>#{i+1}</span>
                    <span style={{ fontSize:13, color:"var(--adm-text)" }}>{s.query}</span>
                  </div>
                  <span style={{ fontSize:12, color:"#c8a26b", fontWeight:600 }}>{s.count}x</span>
                </div>
              ))}
          </div>

          <div style={cardStyle}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <AlertCircle size={16} color="#f87171" />
              <span style={{ fontSize:15, fontWeight:600, color:"var(--adm-text)" }}>Sonuç Bulunamayan</span>
            </div>
            {noResults.length === 0 ? <p style={{ color:"var(--adm-text-muted)", fontSize:13 }}>Veri yok</p> :
              noResults.map(s => (
                <div key={s.query} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize:13, color:"#f87171" }}>{s.query}</span>
                  <span style={{ fontSize:12, color:"#f87171", fontWeight:600 }}>{s.count}x</span>
                </div>
              ))}
          </div>

          <div style={{ ...cardStyle, gridColumn:"1 / -1" }}>
            <p style={{ fontSize:15, fontWeight:600, color:"var(--adm-text)", marginBottom:16 }}>Son Aramalar</p>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                  {["Arama Terimi","Sonuç Sayısı","Tarih"].map(h => (
                    <th key={h} style={{ textAlign:"left", padding:"8px 12px", fontSize:12, color:"var(--adm-text-muted)", fontWeight:500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((s, i) => (
                  <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding:"8px 12px", fontSize:13, color:"var(--adm-text)" }}>{s.query}</td>
                    <td style={{ padding:"8px 12px", fontSize:13, color: s.results_count === 0 ? "#f87171" : "#4ade80" }}>
                      {s.results_count}
                    </td>
                    <td style={{ padding:"8px 12px", fontSize:12, color:"var(--adm-text-muted)" }}>
                      {new Date(s.created_at).toLocaleString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
