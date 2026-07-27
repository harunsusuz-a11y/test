import type { QuizOption } from "@/content/quiz";

export type QuizCategory = "protein-bar" | "findik-kremasi";
export type QuizScores = Record<QuizCategory, number>;

export const emptyScores: QuizScores = { "protein-bar": 0, "findik-kremasi": 0 };

/** Bir cevabın puanlarını mevcut skorlara ekler; yeni bir skor nesnesi döndürür (immutable). */
export function addAnswer(scores: QuizScores, option: QuizOption): QuizScores {
  return {
    "protein-bar": scores["protein-bar"] + option.points["protein-bar"],
    "findik-kremasi": scores["findik-kremasi"] + option.points["findik-kremasi"],
  };
}

/** Skorlara göre kazanan kategoriyi belirler. Eşitlik durumunda protein-bar önceliklidir. */
export function resolveWinner(scores: QuizScores): QuizCategory {
  return scores["protein-bar"] >= scores["findik-kremasi"] ? "protein-bar" : "findik-kremasi";
}
