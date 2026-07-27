// Venti-Ate ürün verisi
// Kaynak: marka kitapçığındaki mockup sayfaları (protein bar + fındık kreması)
// Fiyat ve stok gibi ticari veriler henüz belirlenmediği için DEMO olarak işaretlenmiştir.

export type Product = {
  slug: string;
  name: string;
  category: "protein-bar" | "findik-kremasi";
  flavor: string;
  shortDescription: string;
  description: string;
  proteinPercent?: number;
  hazelnutPercent?: number;
  weightGrams: number;
  price: number; // DEMO fiyat — gerçek fiyatlandırma belirlenince güncellenecek
  compareAtPrice?: number;
  image: string;
  gallery: string[];
  attributes: { label: string; value: string }[];
  isDemo: true;
};

export const products: Product[] = [
  {
    slug: "tiramisu-findikli-protein-bar",
    name: "Tiramisu Fındıklı Protein Bar",
    category: "protein-bar",
    flavor: "Tiramisu",
    shortDescription: "%25 protein, gerçek Giresun fındığıyla.",
    description:
      "Giresun fındığı ve tiramisu aromasının bir araya geldiği, %25 protein oranına sahip atıştırmalık bar. Antrenman öncesi ve sonrası için tasarlandı — çıtır dokusu ve gerçek fındık parçalarıyla.",
    proteinPercent: 25,
    weightGrams: 45,
    price: 39.9,
    image: "/images/hero-bars.jpg",
    gallery: ["/images/hero-bars.jpg", "/images/boxes-left.jpg", "/images/boxes-right.jpg"],
    attributes: [
      { label: "Protein Oranı", value: "%25" },
      { label: "Aroma", value: "Tiramisu & Fındık" },
      { label: "Doku", value: "Çıtır" },
      { label: "Gramaj", value: "45 g" },
      { label: "Menşei", value: "Giresun fındığı, %100 yerli üretim" },
    ],
    isDemo: true,
  },
  {
    slug: "findik-kremasi-50",
    name: "%50 Fındık Kreması",
    category: "findik-kremasi",
    flavor: "Doğal Fındık",
    shortDescription: "%50 fındık oranıyla, tam kavrulmuş fındık içi.",
    description:
      "Tam kavrulmuş Giresun fındığından üretilen, %50 fındık oranına sahip krema. Sabah kahvaltısında ya da antrenman sonrası enerji ihtiyacında — sade ve dürüst içerikle.",
    hazelnutPercent: 50,
    weightGrams: 300,
    price: 149.9,
    image: "/images/cream-pour.jpg",
    gallery: ["/images/cream-pour.jpg", "/images/hand-bars.jpg"],
    attributes: [
      { label: "Fındık Oranı", value: "%50" },
      { label: "Doku", value: "Sürülebilir, pürüzsüz" },
      { label: "Gramaj", value: "300 g" },
      { label: "Menşei", value: "Giresun fındığı, tam kavrulmuş fındık içi" },
    ],
    isDemo: true,
  },
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}
