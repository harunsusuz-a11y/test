"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface Media { id:string; name:string; url:string; mime_type:string|null; size:number|null; alt:string|null; created_at:string; }

export default function AdminMedya() {
  const [files, setFiles] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<Media|null>(null);
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("media").select("*").order("created_at", { ascending:false });
    setFiles((data as Media[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `uploads/${Date.now()}.${ext}`;
    const { data: upload, error } = await supabase.storage.from("media").upload(path, file);
    if (!error && upload) {
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("media").insert({ name:file.name, url:publicUrl, bucket:"media", path, mime_type:file.type, size:file.size, uploaded_by:user?.id });
      load();
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function remove(m: Media) {
    if (!confirm("Dosya silinsin mi?")) return;
    await supabase.storage.from("media").remove([(m as any).path || ""]);
    await supabase.from("media").delete().eq("id", m.id);
    setSelected(null); load();
  }

  function formatSize(bytes: number|null) {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`;
    return `${(bytes/1024/1024).toFixed(1)} MB`;
  }

  const filtered = files.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">Medya Kütüphanesi</div><div className="adm-page-sub">{files.length} dosya</div></div>
        <div style={{ display:"flex", gap:8 }}>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleUpload} />
          <button className="adm-btn adm-btn--primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "Yükleniyor…" : "+ Görsel Yükle"}
          </button>
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <div className="adm-search" style={{ maxWidth:300 }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/></svg>
          <input className="adm-input" placeholder="Dosya ara…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <div className="adm-card"><div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div></div> : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:10 }}>
          {filtered.map(f => (
            <div key={f.id} className="adm-card adm-card--hover" style={{ cursor:"pointer", overflow:"hidden" }} onClick={() => setSelected(f)}>
              <div style={{ height:120, background:"var(--adm-surface-2)", overflow:"hidden" }}>
                {f.mime_type?.startsWith("image/")
                  ? <img src={f.url} alt={f.alt||f.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  : <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", fontSize:10, color:"var(--adm-text-4)" }}>{f.mime_type}</div>
                }
              </div>
              <div style={{ padding:"8px 10px" }}>
                <div style={{ fontSize:11, fontWeight:500, color:"var(--adm-text-2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name}</div>
                <div style={{ fontSize:10, color:"var(--adm-text-4)", marginTop:2 }}>{formatSize(f.size)}</div>
              </div>
            </div>
          ))}
          {filtered.length===0 && <div style={{ gridColumn:"1/-1" }} className="adm-card"><div className="adm-empty"><div className="adm-empty__title">Dosya bulunamadı</div></div></div>}
        </div>
      )}

      {selected && (
        <div className="adm-overlay" onClick={() => setSelected(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">Dosya Detayı</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              {selected.mime_type?.startsWith("image/") && (
                <img src={selected.url} alt={selected.alt||selected.name} style={{ width:"100%", maxHeight:240, objectFit:"contain", borderRadius:6, marginBottom:16, background:"var(--adm-surface-2)" }} />
              )}
              {[["Ad",selected.name],["Tip",selected.mime_type||"—"],["Boyut",formatSize(selected.size)],["Tarih",new Date(selected.created_at).toLocaleDateString("tr-TR")]].map(([k,v]) => (
                <div key={k} style={{ display:"flex", gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:11, color:"var(--adm-text-4)", width:60, flexShrink:0 }}>{k}</span>
                  <span style={{ fontSize:12, color:"var(--adm-text-2)" }}>{v}</span>
                </div>
              ))}
              <div className="adm-field" style={{ marginTop:12 }}>
                <label className="adm-label-text">URL</label>
                <div style={{ display:"flex", gap:6 }}>
                  <input className="adm-input" value={selected.url} readOnly style={{ fontFamily:"var(--adm-mono)", fontSize:10 }} />
                  <button className="adm-btn adm-btn--secondary adm-btn--sm" onClick={() => navigator.clipboard.writeText(selected.url)}>Kopyala</button>
                </div>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn--danger" onClick={() => remove(selected)}>Sil</button>
              <button className="adm-btn adm-btn--secondary" onClick={() => setSelected(null)}>Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
