"use client";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 6 }: SkeletonProps) {
  return (
    <div style={{
      width, height, borderRadius,
      background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
      flexShrink: 0,
    }} />
  );
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:16, padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} height={14} width={i === 0 ? "80%" : i === cols-1 ? "60%" : "70%"} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div style={{ background:"var(--adm-surface)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
      {/* Header */}
      <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:16, padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)" }}>
        {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} height={12} width="60%" />)}
      </div>
      {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} cols={cols} />)}
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ background:"var(--adm-surface)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:20 }}>
      <Skeleton height={20} width="40%" borderRadius={8} />
      <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} height={13} width={i === lines-1 ? "60%" : "100%"} />
        ))}
      </div>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}

export function SkeletonKpiGrid({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${count},1fr)`, gap:16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ background:"var(--adm-surface)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:20 }}>
          <Skeleton height={12} width="50%" />
          <Skeleton height={28} width="70%" borderRadius={8} />
          <Skeleton height={11} width="40%" />
        </div>
      ))}
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}
