"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { quizQuestions, quizResultCopy, type QuizOption } from "@/content/quiz";
import { products } from "@/content/products";
import { ProductCard } from "@/components/product/ProductCard";
import { addAnswer, resolveWinner, emptyScores, type QuizScores } from "@/lib/utils/quiz";

const optionLetters = ["A", "B", "C", "D"];

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
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green/10">
          <Sparkles size={22} className="text-green" aria-hidden="true" />
        </span>
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
          className="mt-8 rounded-full border border-brown/20 px-6 py-2.5 text-sm font-semibold text-brown-dark transition hover:border-green hover:text-green"
        >
          Testi Tekrar Çöz
        </button>
      </motion.div>
    );
  }

  const current = quizQuestions[step];

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brown/10">
          <motion.div
            className="h-full rounded-full bg-green"
            animate={{ width: `${(step / quizQuestions.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <span className="shrink-0 text-xs font-semibold text-brown-dark/50">
          {step + 1}/{quizQuestions.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest2 text-green">
            Soru {step + 1} / {quizQuestions.length}
          </p>
          <h2 className="font-display text-2xl font-extrabold text-brown-darker">{current.question}</h2>

          <div className="mt-6 space-y-3">
            {current.options.map((opt, i) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => answer(opt)}
                className="group flex w-full items-center gap-4 rounded-xl border border-brown/20 bg-white/60 px-5 py-4 text-left font-medium text-brown-darker transition hover:border-green hover:bg-green/10"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brown/20 text-sm font-bold text-brown-dark/60 transition group-hover:border-green group-hover:text-green">
                  {optionLetters[i]}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
