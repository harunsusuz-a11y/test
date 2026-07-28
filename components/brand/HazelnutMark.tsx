/**
 * Marka imza objesi: iki parçaya ayrılan çatlak fındık kabuğu, tek çizgi
 * (line-art) olarak elden çizildi. Sitedeki tüm "nokta ayraç" ve küçük
 * vurgu ikonlarının yerini alır — tekrar ettikçe markanın görsel imzası
 * hâline gelir (eyebrow'lar, marquee ayraçları, PageHeader).
 * Tek renk: currentColor.
 */
export function HazelnutMark({ className = "", size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Sol kabuk parçası */}
      <path d="M15 4.5C9 5.5 5 10.5 5.5 16.5c.4 5 4.5 9 9 9.5" />
      {/* Sağ kabuk parçası */}
      <path d="M17 4.5c6 1 10 6 9.5 12-.4 5-4.5 9-9 9.5" />
      {/* Ortadaki çatlak çizgisi — imzanın kalbi */}
      <path d="M16 4v6.5l-2.6 2.4 3.1 2.6-2.2 2.5 2.7 3-1 4" />
    </svg>
  );
}
