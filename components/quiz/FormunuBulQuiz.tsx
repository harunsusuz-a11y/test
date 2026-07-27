"use client";

import { useState } from "react";
import { quizQuestions, quizResultCopy, type QuizOption } from "@/content/quiz";
import { products } from "@/content/products";
import { ProductCard } from "@/components/product/ProductCard";
import { addAnswer, resolveWinner, emptyScores, type QuizScores } from "@/lib/utils/quiz";

export function FormunuBulQuiz() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<QuizScores>(emptyScores);

  const finished = step >= quizQuestions.length;

  function answer(option: QuizOption) {
    setScores((prev) => addAnswer(prev, option));
    setStep((s) => s + 1);
  }

  function restart() {
    setStep(0);
    setScores(emptyScores);
  }

  if (finished) {
    const winner = resolveWinner(scores);
    const recommended = products.filter((p) => p.category === winner);
    const copy = quizResultCopy[winner];

    return (
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest2 text-green">Sonucun</p>
        <h2 className="mt-3 font-display text-3xl font-extrabold text-brown-darker">{copy.title}</h2>
        <p className="mx-auto mt-3 max-w-md text-brown-dark/70">{copy.description}</p>

        <div className="mx-auto mt-10 grid max-w-2xl gap-6 sm:grid-cols-2">
          {(recommended.length > 0 ? recommended : products).map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>

        <button
          type="button"
          onClick={restart}
          className="mt-8 rounded-full border border-brown/20 px-6 py-2.5 text-sm font-semibold text-brown-dark hover:border-green hover:text-green"
        >
          Testi Tekrar Çöz
        </button>
      </div>
    );
  }

  const current = quizQuestions[step];

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-brown/10">
        <div
          className="h-full rounded-full bg-green transition-all"
          style={{ width: `${(step / quizQuestions.length) * 100}%` }}
        />
      </div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest2 text-green">
        Soru {step + 1} / {quizQuestions.length}
      </p>
      <h2 className="font-display text-2xl font-extrabold text-brown-darker">{current.question}</h2>

      <div className="mt-6 space-y-3">
        {current.options.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => answer(opt)}
            className="w-full rounded-xl border border-brown/20 bg-white/60 px-5 py-4 text-left font-medium text-brown-darker transition hover:border-green hover:bg-green/10"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
