export type QuizOption = { label: string; points: { "protein-bar": number; "findik-kremasi": number } };
export type QuizQuestion = { question: string; options: QuizOption[] };

export const quizQuestions: QuizQuestion[] = [
  {
    question: "Venti-Ate'i günün hangi anında tüketmek istersin?",
    options: [
      { label: "Antrenman öncesi/sonrası", points: { "protein-bar": 2, "findik-kremasi": 0 } },
      { label: "Kahvaltıda", points: { "protein-bar": 0, "findik-kremasi": 2 } },
      { label: "Gün içinde atıştırmalık olarak", points: { "protein-bar": 1, "findik-kremasi": 1 } },
    ],
  },
  {
    question: "Hangi doku sana daha cazip geliyor?",
    options: [
      { label: "Çıtır çıtır", points: { "protein-bar": 2, "findik-kremasi": 0 } },
      { label: "Sürülebilir, pürüzsüz", points: { "protein-bar": 0, "findik-kremasi": 2 } },
    ],
  },
  {
    question: "Önceliğin nedir?",
    options: [
      { label: "Yüksek protein, taşınabilir bir atıştırmalık", points: { "protein-bar": 2, "findik-kremasi": 0 } },
      { label: "Sofrada paylaşılan, sürülebilir bir lezzet", points: { "protein-bar": 0, "findik-kremasi": 2 } },
      { label: "İkisi de olabilir", points: { "protein-bar": 1, "findik-kremasi": 1 } },
    ],
  },
  {
    question: "Nasıl bir ambalaj/taşıma tercih edersin?",
    options: [
      { label: "Çantada taşınabilir, tek seferlik paket", points: { "protein-bar": 2, "findik-kremasi": 0 } },
      { label: "Evde kavanozda duran, paylaşılan bir ürün", points: { "protein-bar": 0, "findik-kremasi": 2 } },
    ],
  },
];

export const quizResultCopy: Record<"protein-bar" | "findik-kremasi", { title: string; description: string }> = {
  "protein-bar": {
    title: "Senin formun: Hareketli ve Pratik.",
    description: "Antrenmana, çantaya, güne katılan; yüksek proteinli ve çıtır bir atıştırmalık seni tanımlıyor.",
  },
  "findik-kremasi": {
    title: "Senin formun: Sofrada Paylaşılan.",
    description: "Kahvaltı sofranın vazgeçilmezi, sürülebilir ve dürüst içerikli bir lezzet seni tanımlıyor.",
  },
};
