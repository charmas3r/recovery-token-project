import {useMemo} from 'react';
import {motion} from 'framer-motion';

export interface CarouselReview {
  id: string;
  body: string;
  rating: number;
  reviewer: {
    name: string;
    verified: boolean;
  };
}

/**
 * Reviews Carousel — full-width animated marquee of review cards.
 * Used on the homepage, product pages and the custom token landing page.
 */
export function ReviewsCarousel({reviews}: {reviews: CarouselReview[]}) {
  // Repeat enough times so the marquee fills the viewport and loops seamlessly.
  // We need at least ~6 visible cards to look like a real stream.
  const repeatCount = Math.max(2, Math.ceil(8 / Math.max(1, reviews.length)));
  const looped = useMemo(
    () => Array.from({length: repeatCount}, () => reviews).flat(),
    [reviews, repeatCount],
  );
  // The marquee translates by 50% (half the total width) to loop, so we need
  // an even number of repetitions. Double the looped array for the x: 0→-50% trick.
  const marqueeItems = useMemo(() => [...looped, ...looped], [looped]);

  // Match landing page pace (~6s per card visible width)
  const duration = looped.length * 6;

  if (reviews.length === 0) return null;

  return (
    <div className="relative">
      {/* Left fade */}
      <div
        className="absolute left-0 top-0 bottom-0 w-24 md:w-40 z-10 pointer-events-none"
        style={{background: 'linear-gradient(to right, #000 0%, transparent 100%)'}}
      />
      {/* Right fade */}
      <div
        className="absolute right-0 top-0 bottom-0 w-24 md:w-40 z-10 pointer-events-none"
        style={{background: 'linear-gradient(to left, #000 0%, transparent 100%)'}}
      />

      <motion.div
        className="flex gap-6"
        animate={{x: ['0%', '-50%']}}
        transition={{
          x: {duration, repeat: Infinity, ease: 'linear'},
        }}
        style={{width: 'max-content'}}
      >
        {marqueeItems.map((review, index) => (
          <div
            key={`${review.id}-${index}`}
            className="flex-shrink-0 w-[340px] md:w-[420px]"
          >
            <div
              className="h-full rounded-2xl p-7 md:p-8 border border-white/[0.08] flex flex-col justify-between"
              style={{background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'}}
            >
              {/* Star rating */}
              <div>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({length: 5}).map((_, i) => (
                    <svg
                      key={i}
                      viewBox="0 0 24 24"
                      className={`w-5 h-5 ${
                        i < review.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-white/20 fill-white/20'
                      }`}
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                {/* Review body */}
                <p style={{fontSize: '0.9375rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem'}}>
                  &ldquo;{review.body}&rdquo;
                </p>
              </div>

              {/* Reviewer info */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-display font-bold text-sm"
                  style={{background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)'}}
                >
                  {review.reviewer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-display font-bold text-white text-sm">
                    {review.reviewer.name}
                  </div>
                  {review.reviewer.name !== 'Verified Buyer' && (
                    <div className="text-xs" style={{color: '#00F260'}}>
                      {review.reviewer.verified ? 'Verified Buyer' : 'Customer'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
