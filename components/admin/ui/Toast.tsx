"use client";
import { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";
type Toast = { id: string; type: ToastType; title: string; message?: string };

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={16} />,
  error:   <XCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info:    <Info size={16} />,
};
const COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg:"rgba(74,222,128,0.08)",  border:"rgba(74,222,128,0.25)",  icon:"#4ade80" },
  error:   { bg:"rgba(248,113,113,0.08)", border:"rgba(248,113,113,0.25)", icon:"#f87171" },
  warning: { bg:"rgba(245,158,11,0.08)",  border:"rgba(245,158,11,0.25)",  icon:"#f59e0b" },
  info:    { bg:"rgba(96,165,250,0.08)",  border:"rgba(96,165,250,0.25)",  icon:"#60a5fa" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(t => [...t.slice(-4), { id, type, title, message }]);
    const timer = setTimeout(() => dismiss(id), 4000);
    timers.current.set(id, timer);
  }, [dismiss]);

  const ctx: ToastContextType = {
    toast,
    success: (t, m) => toast("success", t, m),
    error:   (t, m) => toast("error", t, m),
    warning: (t, m) => toast("warning", t, m),
    info:    (t, m) => toast("info", t, m),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, display:"flex", flexDirection:"column", gap:10, maxWidth:360 }}>
        {toasts.map(t => {
          const c = COLORS[t.type];
          return (
            <div key={t.id}
              style={{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:10, padding:"12px 14px",
                display:"flex", alignItems:"flex-start", gap:10, backdropFilter:"blur(8px)",
                boxShadow:"0 4px 24px rgba(0,0,0,0.3)",
                animation:"slideIn .25s ease-out" }}>
              <span style={{ color:c.icon, flexShrink:0, marginTop:1 }}>{ICONS[t.type]}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontSize:13, fontWeight:600, color:"var(--adm-text)" }}>{t.title}</p>
                {t.message && <p style={{ margin:"3px 0 0", fontSize:12, color:"var(--adm-text-muted)" }}>{t.message}</p>}
              </div>
              <button onClick={() => dismiss(t.id)}
                style={{ background:"transparent", border:"none", color:"var(--adm-text-muted)", cursor:"pointer", padding:2, flexShrink:0 }}>
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
