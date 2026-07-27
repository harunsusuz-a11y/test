import { ShieldCheck, Truck, RotateCcw, Sprout } from "lucide-react";

/**
 * Mağaza/sepet/ödeme sayfalarında tekrar kullanılan güven rozetleri satırı.
 * Ödeme ve kargo ile ilgili ifadeler bilinçli olarak "(demo)" işaretli —
 * henüz gerçek bir ödeme sağlayıcısı veya lojistik anlaşması yok.
 */
export function TrustBadges({ className = "" }: { className?: string }) {
  const items = [
    { icon: Sprout, label: "Gerçek Giresun Fındığı" },
    { icon: ShieldCheck, label: "Güvenli Ödeme (demo)" },
    { icon: Truck, label: "300₺ Üzeri Ücretsiz Kargo" },
    { icon: RotateCcw, label: "Kolay İade (demo)" },
  ];

  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-3 ${className}`}>
      {items.map(({ icon: Icon, label }) => (
        <span key={label} className="flex items-center gap-2 text-xs font-medium text-brown-dark/70">
          <Icon size={15} className="text-green" aria-hidden="true" />
          {label}
        </span>
      ))}
    </div>
  );
}
