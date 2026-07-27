import { describe, it, expect } from "vitest";
import { addAnswer, resolveWinner, emptyScores } from "@/lib/utils/quiz";
import type { QuizOption } from "@/content/quiz";

const proteinHeavy: QuizOption = { label: "a", points: { "protein-bar": 2, "findik-kremasi": 0 } };
const kremaHeavy: QuizOption = { label: "b", points: { "protein-bar": 0, "findik-kremasi": 2 } };
const neutral: QuizOption = { label: "c", points: { "protein-bar": 1, "findik-kremasi": 1 } };

describe("quiz puanlama", () => {
  it("boş skorla başlar", () => {
    expect(emptyScores).toEqual({ "protein-bar": 0, "findik-kremasi": 0 });
  });

  it("addAnswer var olan skora doğru şekilde ekler (immutable)", () => {
    const first = addAnswer(emptyScores, proteinHeavy);
    expect(first).toEqual({ "protein-bar": 2, "findik-kremasi": 0 });
    // orijinal nesne değişmemiş olmalı
    expect(emptyScores).toEqual({ "protein-bar": 0, "findik-kremasi": 0 });
  });

  it("birden fazla cevap birikimli olarak toplanır", () => {
    let scores = emptyScores;
    scores = addAnswer(scores, proteinHeavy);
    scores = addAnswer(scores, neutral);
    expect(scores).toEqual({ "protein-bar": 3, "findik-kremasi": 1 });
  });

  it("protein-bar ağırlıklı cevaplarda protein-bar kazanır", () => {
    let scores = emptyScores;
    scores = addAnswer(scores, proteinHeavy);
    scores = addAnswer(scores, proteinHeavy);
    expect(resolveWinner(scores)).toBe("protein-bar");
  });

  it("fındık-kreması ağırlıklı cevaplarda fındık-kreması kazanır", () => {
    let scores = emptyScores;
    scores = addAnswer(scores, kremaHeavy);
    scores = addAnswer(scores, kremaHeavy);
    expect(resolveWinner(scores)).toBe("findik-kremasi");
  });

  it("eşitlik durumunda protein-bar önceliklidir", () => {
    let scores = emptyScores;
    scores = addAnswer(scores, proteinHeavy);
    scores = addAnswer(scores, kremaHeavy);
    expect(scores["protein-bar"]).toBe(scores["findik-kremasi"]);
    expect(resolveWinner(scores)).toBe("protein-bar");
  });
});
