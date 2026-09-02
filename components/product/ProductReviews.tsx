import { Star, BadgeCheck } from "lucide-react";
import type { Review } from "@/content/reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`5 üzerinden ${rating} puan`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= rating ? "fill-peach text-peach" : "text-brown/20"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function ProductReviews({ reviews, averageRating }: { reviews: Review[]; averageRating: number | null }) {
  if (reviews.length === 0) return null;

  return (
    <section aria-labelledby="reviews-heading" className="mt-20 border-t border-brown/10 pt-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="reviews-heading" className="font-display text-2xl font-bold text-brown-darker">
            Müşteri Yorumları
          </h2>
          {averageRating && (
            <div className="mt-2 flex items-center gap-2">
              <Stars rating={Math.round(averageRating)} />
              <span className="text-sm font-semibold text-brown-darker">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-brown-dark/60">({reviews.length} yorum)</span>
            </div>
          )}
        </div>
        <span className="rounded-full bg-brown/5 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brown-dark/60">
          Örnek / Demo İçerik
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-2xl border border-brown/10 bg-white/50 p-5">
            <div className="mb-2 flex items-center justify-between">
              <Stars rating={review.rating} />
              {review.verifiedPurchase && (
                <span className="flex items-center gap-1 text-xs font-semibold text-green">
                  <BadgeCheck size={14} aria-hidden="true" />
                  Doğrulanmış Alışveriş
                </span>
              )}
            </div>
            <p className="text-sm text-brown-dark/80">{review.comment}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-brown-dark/50">
              {review.authorInitial}
            </p>
          </article>
        ))}
      </div>

      <p className="mt-6 text-xs text-brown-dark/40">
        Bu yorumlar örnek/demo içeriktir, gerçek müşteri yorumlarını yansıtmaz.
      </p>
    </section>
  );
}
