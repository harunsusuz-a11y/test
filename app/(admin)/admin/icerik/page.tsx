"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Tab = "pages" | "blog" | "sss" | "seo";

interface Page { id:string; title:string; slug:string; is_active:boolean; updated_at:string; }
interface BlogPost { id:string; title:string; slug:string; status:string; published_at:string|null; updated_at:string; }
interface SeoMeta { id:string; entity_type:string; entity_id:string; seo_title:string|null; seo_desc:string|null; robots:string|null; }

export default function AdminIcerik() {
  const [tab, setTab] = useState<Tab>("pages");
  const [pages, setPages] = useState<Page[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [seoItems, setSeoItems] = useState<SeoMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageModal, setPageModal] = useState<Partial<Page>|null>(null);
  const [postModal, setPostModal] = useState<Partial<BlogPost>|null>(null);
  const [seoModal, setSeoModal] = useState<Partial<SeoMeta>|null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data:p },{ data:b },{ data:s }] = await Promise.all([
      supabase.from("pages").select("*").order("title"),
      supabase.from("blog_posts").select("*").order("created_at",{ascending:false}),
      supabase.from("seo_metadata").select("*").order("entity_type"),
    ]);
    setPages((p as Page[])||[]);
    setPosts((b as BlogPost[])||[]);
    setSeoItems((s as SeoMeta[])||[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function slugify(s:string) { return s.toLowerCase().replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }

  async function savePage() {
    if (!pageModal?.title) return;
    setSaving(true);
    const { data:{user} } = await supabase.auth.getUser();
    const payload = { title:pageModal.title, slug:pageModal.slug||slugify(pageModal.title||""), is_active:pageModal.is_active??true, created_by:user?.id };
    if (pageModal.id) await supabase.from("pages").update(payload).eq("id",pageModal.id);
    else await supabase.from("pages").insert(payload);
    setSaving(false); setPageModal(null); load();
  }

  async function savePost() {
    if (!postModal?.title) return;
    setSaving(true);
    const { data:{user} } = await supabase.auth.getUser();
    const payload = { title:postModal.title, slug:postModal.slug||slugify(postModal.title||""), status:postModal.status||"draft", author_id:user?.id, published_at:postModal.status==="published"?new Date().toISOString():null };
    if (postModal.id) await supabase.from("blog_posts").update(payload).eq("id",postModal.id);
    else await supabase.from("blog_posts").insert(payload);
    setSaving(false); setPostModal(null); load();
  }

  async function togglePage(id:string, val:boolean) {
    await supabase.from("pages").update({ is_active:val }).eq("id",id);
    setPages(prev => prev.map(p => p.id===id?{...p,is_active:val}:p));
  }

  async function togglePost(id:string, status:string) {
    const next = status==="published"?"draft":"published";
    await supabase.from("blog_posts").update({ status:next, published_at:next==="published"?new Date().toISOString():null }).eq("id",id);
    setPosts(prev => prev.map(p => p.id===id?{...p,status:next}:p));
  }

  async function saveSeo() {
    if (!seoModal?.entity_type || !seoModal?.entity_id) return;
    setSaving(true);
    await supabase.from("seo_metadata").upsert({ entity_type:seoModal.entity_type, entity_id:seoModal.entity_id, seo_title:seoModal.seo_title||null, seo_desc:seoModal.seo_desc||null, robots:seoModal.robots||"index,follow" }, { onConflict:"entity_type,entity_id" });
    setSaving(false); setSeoModal(null); load();
  }

  const TABS: { key:Tab; label:string }[] = [{ key:"pages",label:"Sayfalar" },{ key:"blog",label:"Blog" },{ key:"seo",label:"SEO Meta" },{ key:"sss",label:"SSS" }];

  return (
    <div>
      <div className="adm-page-header">
        <div><div className="adm-page-title">İçerik & SEO</div></div>
        <div style={{ display:"flex", gap:8 }}>
          {tab==="pages" && <button className="adm-btn adm-btn--primary" onClick={()=>setPageModal({ is_active:true })}>+ Yeni Sayfa</button>}
          {tab==="blog" && <button className="adm-btn adm-btn--primary" onClick={()=>setPostModal({ status:"draft" })}>+ Yeni Yazı</button>}
          {tab==="seo" && <button className="adm-btn adm-btn--primary" onClick={()=>setSeoModal({ robots:"index,follow" })}>+ SEO Kaydı</button>}
        </div>
      </div>

      <div className="adm-tabs" style={{ marginBottom:20 }}>
        {TABS.map(t => <button key={t.key} className={`adm-tab${tab===t.key?" active":""}`} onClick={()=>setTab(t.key)}>{t.label}</button>)}
      </div>

      {loading ? <div className="adm-card"><div className="adm-empty"><div className="adm-empty__title">Yükleniyor…</div></div></div> : null}

      {/* Sayfalar */}
      {!loading && tab==="pages" && (
        <div className="adm-card">
          <table className="adm-table">
            <thead><tr><th>Başlık</th><th>Slug</th><th>Güncelleme</th><th>Durum</th><th /></tr></thead>
            <tbody>
              {pages.map(p => (
                <tr key={p.id}>
                  <td className="adm-td--strong">{p.title}</td>
                  <td className="adm-mono adm-text-muted">{p.slug}</td>
                  <td style={{ fontSize:11, color:"var(--adm-text-4)" }}>{new Date(p.updated_at).toLocaleDateString("tr-TR")}</td>
                  <td><div className={`adm-toggle${p.is_active?" on":""}`} onClick={()=>togglePage(p.id,!p.is_active)} /></td>
                  <td><button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={()=>setPageModal({...p})}>Düzenle</button></td>
                </tr>
              ))}
              {pages.length===0 && <tr><td colSpan={5}><div className="adm-empty"><div className="adm-empty__title">Sayfa yok</div></div></td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Blog */}
      {!loading && tab==="blog" && (
        <div className="adm-card">
          <table className="adm-table">
            <thead><tr><th>Başlık</th><th>Slug</th><th>Yayın Tarihi</th><th>Durum</th><th /></tr></thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id}>
                  <td className="adm-td--strong">{p.title}</td>
                  <td className="adm-mono adm-text-muted">{p.slug}</td>
                  <td style={{ fontSize:11, color:"var(--adm-text-4)" }}>{p.published_at?new Date(p.published_at).toLocaleDateString("tr-TR"):"—"}</td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div className={`adm-toggle${p.status==="published"?" on":""}`} onClick={()=>togglePost(p.id,p.status)} />
                      <span className={`adm-badge ${p.status==="published"?"adm-badge--green":"adm-badge--muted"}`}>{p.status==="published"?"Yayında":"Taslak"}</span>
                    </div>
                  </td>
                  <td><button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={()=>setPostModal({...p})}>Düzenle</button></td>
                </tr>
              ))}
              {posts.length===0 && <tr><td colSpan={5}><div className="adm-empty"><div className="adm-empty__title">Blog yazısı yok</div></div></td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* SEO Meta */}
      {!loading && tab==="seo" && (
        <div className="adm-card">
          <table className="adm-table">
            <thead><tr><th>Tür</th><th>Kayıt ID</th><th>SEO Başlık</th><th>Robots</th><th /></tr></thead>
            <tbody>
              {seoItems.map(s => (
                <tr key={s.id}>
                  <td><span className="adm-badge adm-badge--muted">{s.entity_type}</span></td>
                  <td className="adm-mono" style={{ fontSize:10, color:"var(--adm-text-4)" }}>{s.entity_id?.slice(0,12)}…</td>
                  <td style={{ maxWidth:240, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:12, color:"var(--adm-text-2)" }}>{s.seo_title||"—"}</td>
                  <td className="adm-mono adm-text-muted" style={{ fontSize:11 }}>{s.robots||"—"}</td>
                  <td><button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={()=>setSeoModal({...s})}>Düzenle</button></td>
                </tr>
              ))}
              {seoItems.length===0 && <tr><td colSpan={5}><div className="adm-empty"><div className="adm-empty__title">SEO kaydı yok</div></div></td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* SSS Placeholder */}
      {!loading && tab==="sss" && (
        <div className="adm-card"><div className="adm-empty"><div className="adm-empty__title">SSS yönetimi</div>Supabase bağlantısı için pages tablosuna SSS tipi eklenebilir.</div></div>
      )}

      {/* Sayfa Modal */}
      {pageModal && (
        <div className="adm-overlay" onClick={()=>setPageModal(null)}>
          <div className="adm-modal" onClick={e=>e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">{pageModal.id?"Sayfayı Düzenle":"Yeni Sayfa"}</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={()=>setPageModal(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field"><label className="adm-label-text">Başlık</label><input className="adm-input" value={pageModal.title||""} onChange={e=>setPageModal({...pageModal,title:e.target.value,slug:slugify(e.target.value)})} /></div>
              <div className="adm-field"><label className="adm-label-text">Slug</label><input className="adm-input" value={pageModal.slug||""} onChange={e=>setPageModal({...pageModal,slug:e.target.value})} /></div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div className={`adm-toggle${pageModal.is_active?" on":""}`} onClick={()=>setPageModal({...pageModal,is_active:!pageModal.is_active})} />
                <span style={{ fontSize:12, color:"var(--adm-text-2)" }}>Aktif</span>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn--secondary" onClick={()=>setPageModal(null)}>İptal</button>
              <button className="adm-btn adm-btn--primary" onClick={savePage} disabled={saving}>{saving?"Kaydediliyor…":"Kaydet"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Blog Modal */}
      {postModal && (
        <div className="adm-overlay" onClick={()=>setPostModal(null)}>
          <div className="adm-modal" onClick={e=>e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">{postModal.id?"Yazıyı Düzenle":"Yeni Yazı"}</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={()=>setPostModal(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field"><label className="adm-label-text">Başlık</label><input className="adm-input" value={postModal.title||""} onChange={e=>setPostModal({...postModal,title:e.target.value,slug:slugify(e.target.value)})} /></div>
              <div className="adm-field"><label className="adm-label-text">Slug</label><input className="adm-input" value={postModal.slug||""} onChange={e=>setPostModal({...postModal,slug:e.target.value})} /></div>
              <div className="adm-field"><label className="adm-label-text">Durum</label>
                <select className="adm-select" value={postModal.status||"draft"} onChange={e=>setPostModal({...postModal,status:e.target.value})}>
                  <option value="draft">Taslak</option><option value="published">Yayında</option><option value="archived">Arşiv</option>
                </select>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn--secondary" onClick={()=>setPostModal(null)}>İptal</button>
              <button className="adm-btn adm-btn--primary" onClick={savePost} disabled={saving}>{saving?"Kaydediliyor…":"Kaydet"}</button>
            </div>
          </div>
        </div>
      )}

      {/* SEO Modal */}
      {seoModal && (
        <div className="adm-overlay" onClick={()=>setSeoModal(null)}>
          <div className="adm-modal" onClick={e=>e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">SEO Kaydı</span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={()=>setSeoModal(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field-row">
                <div className="adm-field"><label className="adm-label-text">Tür</label><input className="adm-input" value={seoModal.entity_type||""} onChange={e=>setSeoModal({...seoModal,entity_type:e.target.value})} placeholder="product, category…" /></div>
                <div className="adm-field"><label className="adm-label-text">Kayıt ID (UUID)</label><input className="adm-input" value={seoModal.entity_id||""} onChange={e=>setSeoModal({...seoModal,entity_id:e.target.value})} /></div>
              </div>
              <div className="adm-field"><label className="adm-label-text">SEO Başlık</label><input className="adm-input" value={seoModal.seo_title||""} onChange={e=>setSeoModal({...seoModal,seo_title:e.target.value})} maxLength={60} /></div>
              <div className="adm-field"><label className="adm-label-text">SEO Açıklama</label><textarea className="adm-textarea" rows={2} value={seoModal.seo_desc||""} onChange={e=>setSeoModal({...seoModal,seo_desc:e.target.value})} maxLength={160} /></div>
              <div className="adm-field"><label className="adm-label-text">Robots</label>
                <select className="adm-select" value={seoModal.robots||"index,follow"} onChange={e=>setSeoModal({...seoModal,robots:e.target.value})}>
                  <option value="index,follow">index, follow</option>
                  <option value="noindex,follow">noindex, follow</option>
                  <option value="index,nofollow">index, nofollow</option>
                  <option value="noindex,nofollow">noindex, nofollow</option>
                </select>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn--secondary" onClick={()=>setSeoModal(null)}>İptal</button>
              <button className="adm-btn adm-btn--primary" onClick={saveSeo} disabled={saving}>{saving?"Kaydediliyor…":"Kaydet"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
