/**
 * El çizimi kıvrık alt çizgi — önemli kelimelerin altına konur.
 * Tek path, hafif düzensiz (mükemmel sinüs değil) — "elden çizildi" hissi
 * kasıtlı. currentColor ile renklenir; parent'a `relative` + bu bileşene
 * `absolute` konumlama kendisi uyguluyor.
 */
export function Scribble({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 20"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none absolute -bottom-1 left-0 h-[0.35em] w-full ${className}`}
      fill="none"
    >
      <path
        d="M3 13C24 4 44 17 66 9C88 1 110 16 132 8C154 1 176 15 198 7C207 4 213 6 217 9"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}
