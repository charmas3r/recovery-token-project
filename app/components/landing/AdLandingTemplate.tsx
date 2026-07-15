import {Link} from 'react-router';
import {Star, Truck, Shield, Gift, Heart, Sparkles} from 'lucide-react';
import {Button} from '~/components/ui/Button';
import {CustomMilestonesLogo} from '~/components/layout/CustomMilestonesLogo';
import {FadeUp, StaggerContainer, StaggerItem, motion} from '~/components/ui/Animations';
import type {AdLanding, AdLandingTrustPoint} from '~/data/ad-landings';

const ICONS: Record<AdLandingTrustPoint['icon'], typeof Star> = {
  Star,
  Truck,
  Shield,
  Gift,
  Heart,
  Sparkles,
};

const CARD_BG =
  'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)';

/**
 * Primary CTA — links to /custom-token so visitors can choose which
 * customization flow (You Design / We Design) they want, instead of being
 * forced straight into one path.
 */
function PrimaryCta({label}: {label: string}) {
  return (
    <Link to="/custom-token" prefetch="intent" style={{width: '100%', display: 'block'}}>
      <motion.div
        whileHover={{scale: 1.02}}
        whileTap={{scale: 0.98}}
        transition={{duration: 0.2}}
      >
        <Button
          as="span"
          variant="primary"
          size="lg"
          className="w-full sm:w-auto !px-10 !bg-accent !text-black"
        >
          {label}
        </Button>
      </motion.div>
    </Link>
  );
}

function Stars({rating}: {rating: number}) {
  return (
    <div
      style={{display: 'inline-flex', gap: '2px'}}
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({length: 5}).map((_, i) => (
        <Star
          key={`star-${i + 1}`}
          size={18}
          fill={i < Math.round(rating) ? '#FACC15' : 'rgba(255,255,255,0.2)'}
          stroke="none"
        />
      ))}
    </div>
  );
}

export function AdLandingTemplate({landing}: {landing: AdLanding}) {
  return (
    <div style={{background: '#000', color: '#fff', minHeight: '100vh'}}>
      {/* Minimal chrome — logo-only header (links home), no nav */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <CustomMilestonesLogo />
        <Link
          to={landing.secondaryCta.to}
          prefetch="intent"
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {landing.secondaryCta.label}
        </Link>
      </header>

      <main>
        {/* ───────────────────────── Hero ───────────────────────── */}
        <section style={{padding: '2.5rem 1.25rem 3rem'}}>
          <div
            style={{
              maxWidth: '46rem',
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
                marginBottom: '1.25rem',
              }}
            >
              {landing.eyebrow}
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-display, Georgia, serif)',
                fontSize: 'clamp(2.25rem, 6vw, 3.5rem)',
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1.08,
                marginBottom: '1.25rem',
              }}
            >
              {landing.headline}
            </h1>
            <p
              style={{
                fontSize: '1.125rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
                maxWidth: '36rem',
                marginLeft: 'auto',
                marginRight: 'auto',
                marginBottom: '2rem',
              }}
            >
              {landing.subhead}
            </p>

            {/* Dominant primary CTA + lightweight secondary */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.875rem',
              }}
            >
              <div style={{width: '100%', maxWidth: '20rem'}}>
                <PrimaryCta label={landing.primaryCta.label} />
              </div>
              <Link
                to={landing.secondaryCta.to}
                prefetch="intent"
                style={{
                  color: 'rgba(255,255,255,0.55)',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  minHeight: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {landing.secondaryCta.label} →
              </Link>
            </div>

            {/* Rating reassurance directly under CTA */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '1.5rem',
              }}
            >
              <Stars rating={landing.testimonial.rating} />
              <span
                style={{
                  fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.55)',
                }}
              >
                {landing.trustPoints[0]?.label}
              </span>
            </div>
          </div>
        </section>

        {/* ──────────────────────── Trust bar ──────────────────────── */}
        <section
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              maxWidth: '56rem',
              marginLeft: 'auto',
              marginRight: 'auto',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem 2.5rem',
              padding: '1.25rem 1.25rem',
            }}
          >
            {landing.trustPoints.map((point) => {
              const Icon = ICONS[point.icon];
              return (
                <div
                  key={point.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  <Icon size={20} color="#FFFF93" />
                  <span style={{fontSize: '0.875rem', fontWeight: 500}}>
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ───────────────────── How it works ───────────────────── */}
        <section style={{padding: '3.5rem 1.25rem'}}>
          <div style={{maxWidth: '60rem', marginLeft: 'auto', marginRight: 'auto'}}>
            <div
              style={{
                textAlign: 'center',
                marginBottom: '2.5rem',
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
                  marginBottom: '0.75rem',
                }}
              >
                How it works
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-display, Georgia, serif)',
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  lineHeight: 1.15,
                }}
              >
                A meaningful gift in three steps
              </h2>
            </div>

            <StaggerContainer
              className="grid grid-cols-1 sm:grid-cols-3 gap-5"
              staggerDelay={0.1}
            >
              {landing.howItWorks.map((step, i) => (
                <StaggerItem key={step.title}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: '1rem',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: CARD_BG,
                      padding: '1.75rem',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '999px',
                        border: '1px solid rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFF93',
                        fontWeight: 700,
                        marginBottom: '1.25rem',
                      }}
                    >
                      {i + 1}
                    </div>
                    <h3
                      style={{
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '1.125rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.9375rem',
                        lineHeight: 1.55,
                      }}
                    >
                      {step.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ─────────────────── Gift reassurance ─────────────────── */}
        <section style={{padding: '0 1.25rem 3.5rem'}}>
          <div
            style={{
              maxWidth: '60rem',
              marginLeft: 'auto',
              marginRight: 'auto',
              borderRadius: '1.25rem',
              border: '1px solid rgba(255,255,255,0.08)',
              background: CARD_BG,
              padding: 'clamp(1.75rem, 4vw, 2.75rem)',
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
                marginBottom: '0.75rem',
              }}
            >
              {landing.giftReassurance.eyebrow}
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display, Georgia, serif)',
                fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1.15,
                marginBottom: '0.875rem',
              }}
            >
              {landing.giftReassurance.heading}
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '1.0625rem',
                lineHeight: 1.6,
                maxWidth: '40rem',
                marginBottom: '1.75rem',
              }}
            >
              {landing.giftReassurance.body}
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gap: '0.75rem',
              }}
            >
              {landing.giftReassurance.points.map((point) => (
                <li
                  key={point}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: '0.9375rem',
                  }}
                >
                  <Gift size={18} color="#FFFF93" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───────────────────── Social proof ───────────────────── */}
        <section style={{padding: '0 1.25rem 3.5rem'}}>
          <FadeUp className="mx-auto" >
            <div
              style={{
                maxWidth: '44rem',
                marginLeft: 'auto',
                marginRight: 'auto',
                textAlign: 'center',
                borderRadius: '1.25rem',
                border: '1px solid rgba(255,255,255,0.08)',
                background: CARD_BG,
                padding: 'clamp(2rem, 5vw, 3rem)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Stars rating={landing.testimonial.rating} />
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-display, Georgia, serif)',
                  fontSize: 'clamp(1.25rem, 3vw, 1.625rem)',
                  lineHeight: 1.4,
                  color: '#FFFFFF',
                  marginBottom: '1.25rem',
                }}
              >
                “{landing.testimonial.quote}”
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.5)',
                  fontWeight: 600,
                }}
              >
                — {landing.testimonial.name}
              </p>
            </div>
          </FadeUp>
        </section>

        {/* ──────────────────────── FAQ ──────────────────────── */}
        <section style={{padding: '0 1.25rem 3.5rem'}}>
          <div style={{maxWidth: '44rem', marginLeft: 'auto', marginRight: 'auto'}}>
            <div style={{textAlign: 'center', marginBottom: '2rem'}}>
              <span
                style={{
                  display: 'inline-block',
                  color: '#FFFF93',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.25em',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                }}
              >
                Good to know
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-display, Georgia, serif)',
                  fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  lineHeight: 1.15,
                }}
              >
                Questions, answered
              </h2>
            </div>

            <div style={{display: 'grid', gap: '0.875rem'}}>
              {landing.faq.map((item) => (
                <div
                  key={item.question}
                  style={{
                    borderRadius: '1rem',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: CARD_BG,
                    padding: '1.25rem 1.5rem',
                  }}
                >
                  <h3
                    style={{
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '1rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {item.question}
                  </h3>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.9375rem',
                      lineHeight: 1.55,
                    }}
                  >
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────── Final CTA ──────────────────── */}
        <section style={{padding: '0 1.25rem 4rem'}}>
          <div
            style={{
              maxWidth: '46rem',
              marginLeft: 'auto',
              marginRight: 'auto',
              textAlign: 'center',
              borderRadius: '1.25rem',
              border: '1px solid rgba(255,255,255,0.08)',
              background: CARD_BG,
              padding: 'clamp(2.25rem, 6vw, 3.5rem)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display, Georgia, serif)',
                fontSize: 'clamp(1.875rem, 5vw, 2.75rem)',
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1.12,
                marginBottom: '0.875rem',
              }}
            >
              {landing.finalCta.heading}
            </h2>
            <p
              style={{
                fontSize: '1.0625rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
                maxWidth: '34rem',
                marginLeft: 'auto',
                marginRight: 'auto',
                marginBottom: '2rem',
              }}
            >
              {landing.finalCta.subhead}
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <div style={{width: '100%', maxWidth: '20rem'}}>
                <PrimaryCta label={landing.primaryCta.label} />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Slim footer — essential trust/legal only, no full nav */}
      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '1.75rem 1.25rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem 1.5rem',
            marginBottom: '0.875rem',
          }}
        >
          <Link
            to="/policies/privacy-policy"
            prefetch="intent"
            style={linkStyle}
          >
            Privacy
          </Link>
          <Link
            to="/policies/refund-policy"
            prefetch="intent"
            style={linkStyle}
          >
            Returns
          </Link>
          <Link to="/pages/contact" prefetch="intent" style={linkStyle}>
            Contact
          </Link>
        </div>
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          © {new Date().getFullYear()} Custom Milestones. Handcrafted keepsakes,
          made to give.
        </p>
      </footer>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.55)',
  fontSize: '0.8125rem',
  fontWeight: 600,
  textDecoration: 'none',
  minHeight: '44px',
  display: 'inline-flex',
  alignItems: 'center',
};
