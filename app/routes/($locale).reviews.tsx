/**
 * Reviews Page — /reviews
 *
 * Dedicated page showcasing customer reviews with rating summary,
 * distribution breakdown, and full review cards.
 */

import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/reviews';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {JsonLd} from '~/components/seo/JsonLd';
import {Button} from '~/components/ui/Button';
import {buildMeta} from '~/lib/meta';
import {getLocalReviews, getReviewStats} from '~/lib/reviews-data';
import type {LocalReview as Review} from '~/lib/reviews-data';

export const meta: Route.MetaFunction = () => {
  return buildMeta({
    title: 'Customer Reviews — Coinplugz',
    description:
      'Read real reviews from our community. See why thousands trust Coinplugz for meaningful sobriety milestone tokens.',
  });
};

export async function loader(_args: Route.LoaderArgs) {
  const reviews = getLocalReviews();
  const {averageRating, totalCount, distribution} = getReviewStats();
  return {reviews, totalCount, averageRating, distribution};
}

export default function ReviewsPage() {
  const {reviews, totalCount, averageRating, distribution} =
    useLoaderData<typeof loader>();

  const hasReviews = reviews.length > 0;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://coinplugz.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Reviews',
        item: 'https://coinplugz.com/reviews',
      },
    ],
  };

  const organizationJsonLd = hasReviews
    ? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Coinplugz',
        url: 'https://coinplugz.com',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: averageRating.toString(),
          reviewCount: totalCount.toString(),
          bestRating: '5',
          worstRating: '1',
        },
        review: reviews.slice(0, 10).map((review) => ({
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: review.reviewer.name,
          },
          datePublished: review.created_at,
          reviewRating: {
            '@type': 'Rating',
            ratingValue: review.rating.toString(),
            bestRating: '5',
            worstRating: '1',
          },
          name: review.title || undefined,
          reviewBody: review.body,
        })),
      }
    : null;

  return (
    <div className="min-h-screen">
      <JsonLd data={breadcrumbJsonLd} />
      {organizationJsonLd && <JsonLd data={organizationJsonLd} />}

      {/* Header Section */}
      <section className="bg-white/[0.05] py-12 md:py-16">
        <div className="container-standard">
          <Breadcrumbs items={[{label: 'Reviews'}]} className="mb-6" />

          <div
            style={{
              maxWidth: '42rem',
              marginLeft: 'auto',
              marginRight: 'auto',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                color: '#FFFF93',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.25em',
                fontWeight: 600,
                marginBottom: '1rem',
              }}
            >
              Customer Reviews
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-display, serif)',
                fontSize: '3rem',
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1.1,
                marginBottom: '1rem',
              }}
            >
              What Our Community Says
            </h1>
            <p
              style={{
                fontSize: '1.125rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.5)',
                maxWidth: '36rem',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Real stories from people celebrating real milestones. Every token
              carries a journey worth sharing.
            </p>
          </div>
        </div>
      </section>

      {hasReviews ? (
        <>
          {/* Summary Stats */}
          <section className="py-12 md:py-16">
            <div className="container-standard">
              <div
                style={{
                  maxWidth: '48rem',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                <div className="rounded-2xl p-8 border border-white/[0.08]" style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '2rem',
                      alignItems: 'center',
                    }}
                  >
                    {/* Left: Average Rating */}
                    <div style={{textAlign: 'center'}}>
                      <div
                        style={{
                          fontFamily: 'var(--font-display, serif)',
                          fontSize: '4rem',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          lineHeight: 1,
                        }}
                      >
                        {averageRating.toFixed(1)}
                      </div>
                      <div
                        className="flex justify-center gap-1 my-3"
                        role="img"
                        aria-label={`${averageRating} out of 5 stars`}
                      >
                        {Array.from({length: 5}).map((_, i) => (
                          <svg
                            key={i}
                            viewBox="0 0 24 24"
                            className={`w-6 h-6 ${
                              i < Math.round(averageRating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-white/20 fill-white/20'
                            }`}
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: 'rgba(255,255,255,0.5)',
                        }}
                      >
                        Based on {totalCount}{' '}
                        {totalCount === 1 ? 'review' : 'reviews'}
                      </div>
                    </div>

                    {/* Right: Distribution Bars */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                      {([5, 4, 3, 2, 1] as const).map((star) => {
                        const count = distribution[star];
                        const percentage =
                          reviews.length > 0
                            ? Math.round((count / reviews.length) * 100)
                            : 0;
                        return (
                          <div
                            key={star}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: 'rgba(255,255,255,0.5)',
                                width: '3rem',
                                textAlign: 'right',
                              }}
                            >
                              {star} star
                            </span>
                            <div
                              style={{
                                flex: 1,
                                height: '0.5rem',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderRadius: '9999px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  width: `${percentage}%`,
                                  height: '100%',
                                  backgroundColor: '#FFFF93',
                                  borderRadius: '9999px',
                                  transition: 'width 0.5s ease-out',
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: 'rgba(255,255,255,0.4)',
                                width: '2.5rem',
                              }}
                            >
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Reviews Grid */}
          <section className="pb-16 md:pb-20">
            <div className="container-standard">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review, index) => (
                  <ReviewCard key={review.id} review={review} index={index} />
                ))}

                {/* CSS Animation */}
                <style>{`
                  @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                `}</style>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Empty State */
        <section className="py-16 md:py-24">
          <div
            style={{
              maxWidth: '32rem',
              marginLeft: 'auto',
              marginRight: 'auto',
              textAlign: 'center',
              padding: '0 1.5rem',
            }}
          >
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({length: 5}).map((_, i) => (
                <svg
                  key={i}
                  viewBox="0 0 24 24"
                  className="w-8 h-8 text-white/20 fill-white/20"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display, serif)',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: '0.75rem',
              }}
            >
              No Reviews Yet
            </h2>
            <p
              style={{
                fontSize: '1.125rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '2rem',
              }}
            >
              Be the first to share your milestone story. Every journey
              deserves to be celebrated.
            </p>
            <Link to="/collections/all">
              <Button variant="primary" size="lg">
                Shop Tokens
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="py-16 md:py-20 bg-white/[0.05]">
        <div
          style={{
            maxWidth: '1280px',
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              color: '#FFFF93',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            Join Our Community
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.3,
              marginBottom: '1rem',
            }}
          >
            Celebrate Your Milestone
          </h2>
          <p
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '36rem',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: '2rem',
            }}
          >
            Every token tells a story. Find the perfect way to honor your
            journey or celebrate someone you love.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/collections/all">
              <Button variant="primary" size="lg">
                Shop Tokens
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" size="lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ReviewCard({review, index}: {review: Review; index: number}) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div
      className="rounded-2xl p-6 border border-white/[0.08] hover:border-white/[0.15] hover:-translate-y-1 transition-all duration-300"
      style={{
        background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
        animation: 'fadeInUp 0.5s ease-out forwards',
        animationDelay: `${index * 100}ms`,
        opacity: 0,
      }}
    >
      {/* Header with rating and date */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-0.5">
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
        {review.created_at && (
          <span className="text-xs text-white/40">
            {formatDate(review.created_at)}
          </span>
        )}
      </div>

      {/* Review title */}
      {review.title && (
        <h4 className="font-display font-bold text-white text-lg mb-2">
          {review.title}
        </h4>
      )}

      {/* Review body */}
      <p className="text-body-sm text-white/50 leading-relaxed mb-5">
        &ldquo;{review.body}&rdquo;
      </p>

      {/* Reviewer info */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/[0.08]">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center text-white font-display font-bold text-sm">
          {review.reviewer.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-white truncate">
            {review.reviewer.name}
          </div>
          {review.reviewer.verified ? (
            <div className="flex items-center gap-1.5 text-xs text-accent font-medium">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-4 h-4 flex-shrink-0"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              Verified Buyer
            </div>
          ) : (
            <div className="text-xs text-white/40">Customer</div>
          )}
        </div>
      </div>
    </div>
  );
}
