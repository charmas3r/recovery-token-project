import {Suspense} from 'react';
import {Await, Link, useRouteLoaderData} from 'react-router';
import {getReviewStats} from '~/lib/reviews-data';
import type {ReviewStats} from '~/lib/reviews-data';
import type {RootLoader} from '~/root';

interface ReviewsCalloutProps {
  variant?: 'inline' | 'banner';
  className?: string;
}

/**
 * Rating + review count linking to /reviews. Uses live stats from the root
 * loader; shows the Etsy-export stats while they load or if they fail.
 */
export function ReviewsCallout(props: ReviewsCalloutProps) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  const fallback = <ReviewsCalloutView {...props} stats={getReviewStats()} />;

  if (!rootData?.reviewStats) return fallback;

  return (
    <Suspense fallback={fallback}>
      <Await resolve={rootData.reviewStats} errorElement={fallback}>
        {(stats) => <ReviewsCalloutView {...props} stats={stats} />}
      </Await>
    </Suspense>
  );
}

function ReviewsCalloutView({
  variant = 'inline',
  className = '',
  stats,
}: ReviewsCalloutProps & {stats: ReviewStats}) {
  const {averageRating, totalCount} = stats;
  if (totalCount === 0) return null;

  if (variant === 'banner') {
    return (
      <Link
        to="/reviews"
        prefetch="intent"
        className={className}
        style={{
          display: 'block',
          textDecoration: 'none',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.08)',
          background:
            'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
          padding: '1.5rem 2rem',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{display: 'flex', alignItems: 'center', gap: '1rem'}}
          >
            <Stars rating={averageRating} size={22} />
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display, serif)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  lineHeight: 1,
                }}
              >
                {averageRating.toFixed(1)} out of 5
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.5)',
                  marginTop: '0.25rem',
                }}
              >
                From {totalCount} verified buyers
              </div>
            </div>
          </div>
          <span
            style={{
              color: '#FFFF93',
              fontSize: '0.875rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            Read all reviews →
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/reviews"
      prefetch="intent"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.625rem',
        textDecoration: 'none',
        color: 'rgba(255,255,255,0.85)',
        fontSize: '0.875rem',
      }}
    >
      <Stars rating={averageRating} size={16} />
      <span style={{fontWeight: 600, color: '#FFFFFF'}}>
        {averageRating.toFixed(1)}
      </span>
      <span style={{color: 'rgba(255,255,255,0.5)'}}>
        · {totalCount} verified reviews
      </span>
      <span
        style={{
          color: '#FFFF93',
          fontWeight: 600,
        }}
      >
        See all →
      </span>
    </Link>
  );
}

function Stars({rating, size}: {rating: number; size: number}) {
  return (
    <div
      style={{display: 'inline-flex', gap: '2px'}}
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({length: 5}).map((_, i) => {
        const filled = i < Math.round(rating);
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? '#FACC15' : 'rgba(255,255,255,0.2)'}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      })}
    </div>
  );
}
