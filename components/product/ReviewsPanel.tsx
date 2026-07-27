import { Star, BadgeCheck, Quote } from "lucide-react";
import type { Review } from "@/content/reviews";
import type { ProductTheme } from "@/lib/utils/product-theme";

/**
 * Yorumlar redesign'ı: solda puan özeti + dağılım barları,
 * sağda büyük tırnaklı öne çıkan yorum + diğer yorum kartları.
 * Veriler demo — arayüzde açıkça işaretlenir; gerçek yorum sistemi
 * bağlandığında yalnızca veri kaynağı değişecek.
 */
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5" role="img" aria-label={`5 üzerinden ${rating} puan`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(rating) ? "fill-peach text-peach" : "text-brown/20"} aria-hidden="true" />
      ))}
    </span>
  );
}

export function ReviewsPanel({
  reviews,
  averageRating,
  theme,
}: {
  reviews: Review[];
  averageRating: number | null;
  theme: ProductTheme;
}) {
  if (reviews.length === 0) return null;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  // Öne çıkan: en yüksek puanlı, en uzun yorum
  const featured = [...reviews].sort((a, b) => b.rating - a.rating || b.comment.length - a.comment.length)[0];
  const rest = reviews.filter((r) => r.id !== featured.id);

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_1.6fr]">
      {/* Özet + dağılım */}
      <div className="rounded-3xl border border-brown/10 bg-white/60 p-7">
        <div className="flex items-end gap-3">
          <span className="font-display text-5xl font-extrabold text-brown-darker">
            {averageRating?.toFixed(1) ?? "—"}
          </span>
          <div className="pb-1.5">
            {averageRating && <Stars rating={averageRating} size={16} />}
            <p className="mt-1 text-xs text-brown-dark/60">
              {reviews.length} yorum <span className="text-brown-dark/40">(demo veri)</span>
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-2.5">
          {distribution.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-3 text-xs">
              <span className="w-6 shrink-0 font-bold text-brown-dark/70">{star}★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-brown/10">
                <div
                  className={`h-full rounded-full ${theme.accentBg}`}
                  style={{ width: `${(count / reviews.length) * 100}%` }}
                />
              </div>
              <span className="w-5 shrink-0 text-right tabular-nums text-brown-dark/50">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Öne çıkan + diğerleri */}
      <div className="space-y-4">
        <blockquote className={`relative rounded-3xl p-8 text-cream ${theme.heroBg}`}>
          <Quote size={36} aria-hidden="true" className={`absolute right-6 top-6 opacity-20 ${theme.accentText}`} />
          <Stars rating={featured.rating} />
          <p className="mt-4 font-display text-xl font-semibold leading-snug">&ldquo;{featured.comment}&rdquo;</p>
          <footer className="mt-4 flex items-center gap-2 text-xs text-cream/60">
            {featured.authorInitial}
            {featured.verifiedPurchase && (
              <span className="flex items-center gap-1">
                <BadgeCheck size={13} aria-hidden="true" className={theme.accentText} />
                Doğrulanmış alışveriş (demo)
              </span>
            )}
          </footer>
        </blockquote>

        <div className="grid gap-4 sm:grid-cols-2">
          {rest.map((review) => (
            <article key={review.id} className="rounded-2xl border border-brown/10 bg-white/60 p-5">
              <div className="flex items-center justify-between">
                <Stars rating={review.rating} />
                <span className="text-xs font-semibold text-brown-dark/50">{review.authorInitial}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-brown-dark/80">{review.comment}</p>
              {review.verifiedPurchase && (
                <p className="mt-3 flex items-center gap-1 text-[11px] text-brown-dark/50">
                  <BadgeCheck size={12} className="text-green" aria-hidden="true" />
                  Doğrulanmış alışveriş (demo)
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
