import type { ReactNode } from "react";

/**
 * Organik "blob" çerçeve: mükemmel dikdörtgen/rounded-rect yerine düzensiz
 * kenarlı bir çerçeve. CSS border-radius'un 8 değerli (yatay/dikey ayrı)
 * biçimiyle üretilir — clip-path'e göre daha hafif ve her tarayıcıda tutarlı.
 * Yalnızca HERO görsellerinde kullanılır (ürün galerisi gibi işlevsel/ızgara
 * alanlarda değil) — asimetri burada "imza", orada "kafa karışıklığı" olur.
 */
const BLOBS = [
  "62% 38% 55% 45% / 45% 40% 60% 55%",
  "38% 62% 47% 53% / 55% 45% 55% 45%",
  "55% 45% 63% 37% / 40% 58% 42% 60%",
];

export function OrganicFrame({
  children,
  variant = 0,
  rotate = 0,
  className = "",
}: {
  children: ReactNode;
  variant?: number;
  /** derece cinsinden hafif döndürme — asimetri için 2-4 derece yeterli */
  rotate?: number;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        borderRadius: BLOBS[variant % BLOBS.length],
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
      }}
    >
      {children}
    </div>
  );
}
