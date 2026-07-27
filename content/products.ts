// Venti-Ate ürün verisi
// Kaynak: marka kitapçığındaki mockup sayfaları (protein bar + fındık kreması)
// Fiyat, stok, besin değeri ve içindekiler gibi ticari/teknik veriler henüz
// resmi olarak onaylanmadığı için DEMO olarak işaretlenmiştir — gerçek
// üretim/etiket bilgisi geldiğinde bu dosya güncellenmelidir.

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
  highlights: string[];
  ingredients: string[];
  nutritionPer100g: { label: string; value: string }[];
  usageTips: string[];
  faq: { question: string; answer: string }[];
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
    compareAtPrice: 49.9,
    image: "/images/hero-bars.jpg",
    gallery: ["/images/hero-bars.jpg", "/images/boxes-left.jpg", "/images/boxes-right.jpg", "/images/hand-bars.jpg"],
    attributes: [
      { label: "Protein Oranı", value: "%25" },
      { label: "Aroma", value: "Tiramisu & Fındık" },
      { label: "Doku", value: "Çıtır" },
      { label: "Gramaj", value: "45 g" },
      { label: "Menşei", value: "Giresun fındığı, %100 yerli üretim" },
    ],
    highlights: [
      "Gerçek Giresun fındığı — dolgu maddesi veya aroma vermesi değil",
      "Antrenman öncesi/sonrası için yüksek protein oranı",
      "Aşırı tatlandırılmamış, dengeli tiramisu aroması",
      "Çantada dağılmayan, çıtır ama kırılgan olmayan doku",
    ],
    ingredients: [
      "Giresun fındığı",
      "Protein karışımı (whey/bitkisel — kesin oran onaylanınca güncellenecek)",
      "Kakao",
      "Doğal tiramisu aroması",
      "Çıtır tahıl parçaları",
      "Az miktarda doğal tatlandırıcı",
    ],
    nutritionPer100g: [
      { label: "Enerji", value: "~410 kcal" },
      { label: "Protein", value: "~25 g" },
      { label: "Yağ", value: "~18 g" },
      { label: "Karbonhidrat", value: "~35 g" },
      { label: "Şeker", value: "~8 g" },
      { label: "Lif", value: "~5 g" },
    ],
    usageTips: [
      "Antrenmandan 30-45 dakika önce enerji desteği olarak tüket",
      "Antrenman sonrası toparlanma atıştırmalığı olarak kullan",
      "Öğün arası kan şekerini dengelemek için tam öğün yerine geçmez, destekleyici atıştırmalıktır",
      "Serin ve kuru yerde sakla; doğrudan güneş ışığından uzak tut",
    ],
    faq: [
      {
        question: "Bu bar tam öğün yerine geçer mi?",
        answer: "Hayır — bir ana öğünün yerine geçmesi için tasarlanmadı. Antrenman öncesi/sonrası veya öğün arası destekleyici bir atıştırmalık olarak düşünülmelidir.",
      },
      {
        question: "İçinde gerçek fındık parçaları var mı, yoksa sadece aroma mı?",
        answer: "Gerçek Giresun fındığı kullanılıyor — kesitte görülebilen fındık parçaları aromadan değil, doğrudan hammaddeden gelir.",
      },
      {
        question: "Glutensiz mi?",
        answer: "Bu bilgi henüz resmi olarak onaylanmadı — kesin alerjen ve glutensizlik bilgisi ürün etiketi netleşince burada güncellenecektir.",
      },
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
    gallery: ["/images/cream-pour.jpg", "/images/hand-bars.jpg", "/images/lifestyle-waffle.jpg"],
    attributes: [
      { label: "Fındık Oranı", value: "%50" },
      { label: "Doku", value: "Sürülebilir, pürüzsüz" },
      { label: "Gramaj", value: "300 g" },
      { label: "Menşei", value: "Giresun fındığı, tam kavrulmuş fındık içi" },
    ],
    highlights: [
      "Piyasa ortalamasının çok üzerinde fındık oranı (%50)",
      "Aşırı şekerli değil — fındığın kendi karakterini bastırmaz",
      "Palm yağı içermez (formülasyon onaylanınca kesinleşecek)",
      "Cam kavanozda, yeniden kullanılabilir ambalaj",
    ],
    ingredients: [
      "Kavrulmuş Giresun fındığı (%50)",
      "Kakao",
      "Az miktarda doğal tatlandırıcı",
      "Bitkisel yağ (kaynağı onaylanınca güncellenecek)",
      "Tuz (eser miktarda)",
    ],
    nutritionPer100g: [
      { label: "Enerji", value: "~570 kcal" },
      { label: "Protein", value: "~8 g" },
      { label: "Yağ", value: "~38 g" },
      { label: "Karbonhidrat", value: "~42 g" },
      { label: "Şeker", value: "~28 g" },
      { label: "Lif", value: "~4 g" },
    ],
    usageTips: [
      "Sabah kahvaltısında ekmek, waffle veya yulaf üzerine sürerek tüket",
      "Antrenman sonrası hızlı enerji için bir kaşık doğrudan tüketilebilir",
      "Açıldıktan sonra serin yerde sakla, buzdolabında saklamak kıvamı sertleştirebilir",
      "Kullanmadan önce hafifçe karıştır — doğal fındık yağı üstte ayrışabilir",
    ],
    faq: [
      {
        question: "Buzdolabında saklamam gerekiyor mu?",
        answer: "Zorunlu değil — serin ve kuru bir yerde saklamak yeterlidir. Buzdolabında saklanırsa kıvamı sertleşebilir.",
      },
      {
        question: "Neden bazen üstünde yağ birikmesi oluyor?",
        answer: "Katkı maddesiz, yüksek fındık oranlı kremalarda doğal bir durumdur — kullanmadan önce karıştırman yeterli.",
      },
      {
        question: "Vegan mı?",
        answer: "İçerik listesi kesinleşince bu bilgi burada netleştirilecek — şu an için resmi bir vegan onayı verilmemiştir.",
      },
    ],
    isDemo: true,
  },
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export const categories: { slug: "protein-bar" | "findik-kremasi"; label: string; description: string }[] = [
  {
    slug: "protein-bar",
    label: "Protein Barlar",
    description: "Antrenman öncesi ve sonrası için, %25 protein oranıyla çıtır atıştırmalıklar.",
  },
  {
    slug: "findik-kremasi",
    label: "Fındık Kremaları",
    description: "Yüksek fındık oranıyla, sabah sofrasının ya da antrenman sonrasının klasiği.",
  },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getProductsByCategory(slug: string) {
  return products.filter((p) => p.category === slug);
}
