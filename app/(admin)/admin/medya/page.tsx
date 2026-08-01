"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface Media {
  id: string; name: string; url: string; mime_type: string | null;
  size: number | null; alt: string | null; title: string | null; created_at: string;
}

const BUCKET = "media";

export default function AdminMedya() {
  const [files, setFiles] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selected, setSelected] = useState<Media | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [bucketError, setBucketError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    setFiles((data as Media[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowed = ["image/jpeg","image/png","image/webp","image/gif","image/svg+xml"];
    if (!allowed.includes(file.type)) {
      alert("Sadece görsel dosyaları yüklenebilir (JPG, PNG, WebP, GIF, SVG)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Dosya boyutu 10MB'dan küçük olmalıdır.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const ext = file.name.split(".").pop();
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data: upload, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false });

    if (uploadError) {
      if (uploadError.message.includes("Bucket not found")) {
        setBucketError(true);
      } else {
        alert(`Yükleme hatası: ${uploadError.message}`);
      }
      setUploading(false);
      return;
    }

    if (upload) {
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("media").insert({
        name: file.name,
        url: publicUrl,
        bucket: BUCKET,
        path,
        mime_type: file.type,
        size: file.size,
        uploaded_by: user?.id,
      });
      load();
    }

    setUploading(false);
    setUploadProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function remove(m: Media) {
    if (!confirm("Dosya silinsin mi?")) return;
    // Try to delete from storage
    await supabase.storage.from(BUCKET).remove([(m as any).path || ""]);
    await supabase.from("media").delete().eq("id", m.id);
    setSelected(null);
    load();
  }

  async function updateAlt(id: string, alt: string) {
    await supabase.from("media").update({ alt }).eq("id", id);
    setFiles(prev => prev.map(f => f.id === id ? { ...f, alt } : f));
    setSelected(prev => prev ? { ...prev, alt } : null);
  }

  function formatSize(bytes: number | null) {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  const filtered = files.filter(f => {
    const ms = filterType === "all" ||
      (filterType === "image" && f.mime_type?.startsWith("image/")) ||
      (filterType === "other" && !f.mime_type?.startsWith("image/"));
    const mq = !search || f.name.toLowerCase().includes(search.toLowerCase());
    return ms && mq;
  });

  const totalSize = files.reduce((s, f) => s + (f.size || 0), 0);

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Medya Kütüphanesi</div>
          <div className="adm-page-sub">{files.length} dosya · {formatSize(totalSize)}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
          <button className="adm-btn adm-btn--primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? `Yükleniyor…` : "+ Görsel Yükle"}
          </button>
        </div>
      </div>

      {bucketError && (
        <div style={{ background: "var(--adm-yellow-dim)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 12, color: "var(--adm-yellow)" }}>
          <strong>Storage bucket kurulumu gerekli.</strong> Supabase Dashboard → Storage → New Bucket → <strong>media</strong> (Public) oluştur.
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <div className="adm-tabs">
          {[["all","Tümü"],["image","Görseller"],["other","Diğer"]].map(([k,l]) => (
            <button key={k} className={`adm-tab${filterType===k?" active":""}`} onClick={() => setFilterType(k)}>{l}</button>
          ))}
        </div>
        <div className="adm-search" style={{ flex: 1, maxWidth: 300 }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/></svg>
          <input className="adm-input" placeholder="Dosya ara…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span style={{ fontSize: 11, color: "var(--adm-text-4)", marginLeft: "auto" }}>{filtered.length} dosya gösteriliyor</span>
      </div>

      {loading ? (
        <div className="adm-card"><div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div></div>
      ) : filtered.length === 0 ? (
        <div className="adm-card">
          <div className="adm-empty">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" width="32" height="32"><rect x="1" y="2" width="14" height="12" rx="1.5"/><circle cx="5.5" cy="6.5" r="1.5"/><path d="M1 12l4-4 3 3 2-2 5 5"/></svg>
            <div className="adm-empty__title">Dosya bulunamadı</div>
            Görsel yüklemek için "+ Görsel Yükle" butonuna bas.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
          {filtered.map(f => (
            <div
              key={f.id}
              className="adm-card adm-card--hover"
              style={{ cursor: "pointer", overflow: "hidden", outline: selected?.id === f.id ? "2px solid var(--adm-accent)" : "none" }}
              onClick={() => setSelected(f)}
            >
              <div style={{ height: 120, background: "var(--adm-surface-2)", overflow: "hidden", position: "relative" }}>
                {f.mime_type?.startsWith("image/")
                  ? <img src={f.url} alt={f.alt || f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 6 }}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" width="24" height="24" style={{ opacity: 0.3 }}><rect x="2" y="1" width="12" height="14" rx="1.5"/><line x1="5" y1="5" x2="11" y2="5"/><line x1="5" y1="8" x2="11" y2="8"/><line x1="5" y1="11" x2="8" y2="11"/></svg>
                      <span style={{ fontSize: 9, color: "var(--adm-text-4)" }}>{f.mime_type?.split("/")[1]?.toUpperCase()}</span>
                    </div>
                  )
                }
              </div>
              <div style={{ padding: "8px 10px" }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: "var(--adm-text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={f.name}>{f.name}</div>
                <div style={{ fontSize: 10, color: "var(--adm-text-4)", marginTop: 2, display: "flex", justifyContent: "space-between" }}>
                  <span>{formatSize(f.size)}</span>
                  <span>{new Date(f.created_at).toLocaleDateString("tr-TR")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="adm-overlay" onClick={() => setSelected(null)}>
          <div className="adm-modal adm-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title" style={{ fontFamily: "var(--adm-mono)", fontSize: 12 }}>{selected.name}</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  {selected.mime_type?.startsWith("image/") && (
                    <img src={selected.url} alt={selected.alt || selected.name}
                      style={{ width: "100%", maxHeight: 280, objectFit: "contain", borderRadius: 6, background: "var(--adm-surface-2)", marginBottom: 12 }} />
                  )}
                  <div className="adm-field">
                    <label className="adm-label-text">Alt Metin</label>
                    <input className="adm-input" defaultValue={selected.alt || ""} onBlur={e => updateAlt(selected.id, e.target.value)} placeholder="Görsel açıklaması…" />
                  </div>
                </div>
                <div>
                  {[
                    ["Dosya Adı", selected.name],
                    ["Tür", selected.mime_type || "—"],
                    ["Boyut", formatSize(selected.size)],
                    ["Yükleme", new Date(selected.created_at).toLocaleString("tr-TR")],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 11, color: "var(--adm-text-4)", width: 80, flexShrink: 0 }}>{k}</span>
                      <span style={{ fontSize: 12, color: "var(--adm-text-2)", wordBreak: "break-all" }}>{v}</span>
                    </div>
                  ))}
                  <div className="adm-field" style={{ marginTop: 8 }}>
                    <label className="adm-label-text">Genel URL</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input className="adm-input" value={selected.url} readOnly style={{ fontFamily: "var(--adm-mono)", fontSize: 10 }} />
                      <button className="adm-btn adm-btn--secondary adm-btn--sm" style={{ flexShrink: 0 }}
                        onClick={() => { navigator.clipboard.writeText(selected.url); }}>Kopyala</button>
                    </div>
                  </div>
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
