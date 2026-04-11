/**
 * CustomTokenFeatureBlock — Shared feature card surfacing the /custom-token flow
 *
 * Used by: GenericSEOLandingTemplate, CustomIntentLandingTemplate
 * Layout: Full-width dark-gradient card. Two columns on desktop (stacks on mobile):
 *   Left — three-step process visual (Share → Review → Receive)
 *   Right — eyebrow, headline, body, two CTAs
 *
 * Per-page copy overrides via the `copy` prop (from SEOPage.customTokenBlock).
 * Falls back to the DEFAULT_COPY below when any field is omitted.
 */

import {Link} from 'react-router';
import {Button} from '~/components/ui/Button';
import type {CustomTokenBlockCopy} from '~/data/seo-pages';

interface CustomTokenFeatureBlockProps {
  copy?: CustomTokenBlockCopy;
  className?: string;
}

const DEFAULT_COPY = {
  eyebrow: 'The Coinplugz Difference',
  headline: "Can't find exactly what you want? Create your own.",
  body:
    "Every recovery journey is different. That's why we built two ways to make a token that's truly yours — whether you want us to design it from your story, or you want to control every detail.",
  primaryCtaLabel: 'Start Designing',
  secondaryCtaLabel: 'See How It Works',
};

const STEPS = [
  {number: 1, label: 'Share your vision'},
  {number: 2, label: 'Review the design'},
  {number: 3, label: 'Receive your token'},
];

export function CustomTokenFeatureBlock({
  copy,
  className = '',
}: CustomTokenFeatureBlockProps) {
  const eyebrow = copy?.eyebrow || DEFAULT_COPY.eyebrow;
  const headline = copy?.headline || DEFAULT_COPY.headline;
  const body = copy?.body || DEFAULT_COPY.body;
  const primaryCtaLabel = copy?.primaryCtaLabel || DEFAULT_COPY.primaryCtaLabel;
  const secondaryCtaLabel =
    copy?.secondaryCtaLabel || DEFAULT_COPY.secondaryCtaLabel;

  return (
    <section
      className={`rounded-2xl border border-white/[0.08] ${className}`}
      style={{
        background:
          'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: '2.5rem',
          padding: '3rem',
          alignItems: 'center',
        }}
        className="md:!grid-cols-2"
      >
        {/* Left: three-step visual */}
        <div>
          <ol
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}
          >
            {STEPS.map((step, idx) => (
              <li
                key={step.number}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '9999px',
                    border: '1px solid rgba(184,118,79,0.5)',
                    backgroundColor: 'rgba(184,118,79,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#B8764F',
                    fontFamily: 'var(--font-display, serif)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {step.number}
                </div>
                <span
                  style={{
                    fontSize: '1rem',
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 500,
                  }}
                >
                  {step.label}
                </span>
                {idx < STEPS.length - 1 && (
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      left: '1.5rem',
                      top: '3rem',
                      width: '1px',
                      height: '1.5rem',
                      backgroundColor: 'rgba(184,118,79,0.3)',
                    }}
                  />
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* Right: eyebrow + headline + body + CTAs */}
        <div>
          <span
            style={{
              display: 'inline-block',
              color: '#B8764F',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            {eyebrow}
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.2,
              marginBottom: '1rem',
            }}
          >
            {headline}
          </h2>
          <p
            style={{
              fontSize: '1.0625rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '2rem',
            }}
          >
            {body}
          </p>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.75rem'}}>
            <Link to="/custom-token" prefetch="intent">
              <Button
                variant="primary"
                size="lg"
                className="!bg-accent !text-black"
              >
                {primaryCtaLabel}
              </Button>
            </Link>
            <Link to="/custom-token#how-it-works" prefetch="intent">
              <Button
                variant="secondary"
                size="lg"
                className="!border-white/30 !text-white"
              >
                {secondaryCtaLabel}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
