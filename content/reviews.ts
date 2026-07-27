// Venti-Ate — ÖRNEK/DEMO müşteri yorumları
// UYARI: Bunlar gerçek müşteri yorumları DEĞİLDİR. Gerçek yorum verisi bağlanana
// kadar arayüz taslağını göstermek amacıyla oluşturulmuş demo içeriktir.
// Prod'a geçmeden önce gerçek bir yorum sistemine (ör. Trendyol/Yorumsepeti/kendi
// backend'iniz) bağlanmalı ve bu dosyadaki isDemo:true veriler kaldırılmalıdır.

export type Review = {
  id: string;
  productSlug: string;
  authorInitial: string; // Gizlilik için tam isim değil, baş harf
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  verifiedPurchase: boolean;
  isDemo: true;
};

export const reviews: Review[] = [
  {
    id: "r1",
    productSlug: "tiramisu-findikli-protein-bar",
    authorInitial: "E.K.",
    rating: 5,
    comment: "Antrenman sonrası tam kıvamında, fındık parçaları gerçekten hissediliyor.",
    verifiedPurchase: true,
    isDemo: true,
  },
  {
    id: "r2",
    productSlug: "tiramisu-findikli-protein-bar",
    authorInitial: "M.T.",
    rating: 4,
    comment: "Tiramisu aroması abartılı değil, dengeli. Çantada dağılmıyor.",
    verifiedPurchase: true,
    isDemo: true,
  },
  {
    id: "r3",
    productSlug: "tiramisu-findikli-protein-bar",
    authorInitial: "S.A.",
    rating: 5,
    comment: "Diğer protein barlara göre daha az tatlı, bu da artı puan.",
    verifiedPurchase: false,
    isDemo: true,
  },
  {
    id: "r4",
    productSlug: "findik-kremasi-50",
    authorInitial: "B.Y.",
    rating: 5,
    comment: "Kahvaltıda vazgeçilmez oldu, fındık oranı gerçekten yüksek hissediliyor.",
    verifiedPurchase: true,
    isDemo: true,
  },
  {
    id: "r5",
    productSlug: "findik-kremasi-50",
    authorInitial: "C.D.",
    rating: 4,
    comment: "Kıvamı sürülebilir ama akıcı değil, tam istediğim gibi.",
    verifiedPurchase: true,
    isDemo: true,
  },
];

export function getReviewsForProduct(slug: string): Review[] {
  return reviews.filter((r) => r.productSlug === slug);
}

export function getAverageRating(slug: string): number | null {
  const productReviews = getReviewsForProduct(slug);
  if (productReviews.length === 0) return null;
  return productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
}
