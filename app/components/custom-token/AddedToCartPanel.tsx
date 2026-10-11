import {useEffect} from 'react';
import {Link} from 'react-router';
import {trackBeginCheckout} from '~/components/cart/CartSummary';
import {trackEvent} from '~/lib/ga4';

interface AddedToCartPanelProps {
  path: 'we-design' | 'you-design';
  /** True while the /cart LinesAdd request is in flight. */
  adding: boolean;
  /** Response from the /cart action ({cart, errors}). */
  cartResult?: {cart?: any; errors?: Array<{message?: string}> | null} | null;
  /** Front design image to show as a confirmation thumbnail. */
  previewUrl?: string;
}

const primaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.875rem 1.5rem',
  borderRadius: '0.75rem',
  border: 'none',
  background: '#B8764F',
  color: '#000000',
  fontWeight: 600,
  fontSize: '0.9375rem',
  minHeight: '48px',
  textDecoration: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const secondaryButtonStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.3)',
  color: '#FFFFFF',
};

/**
 * Final step of the custom-token wizard: once the design is added to the cart,
 * ask the customer whether to check out or design another token, so the flow
 * doesn't dead-end on a small "View Cart" link.
 */
export function AddedToCartPanel({path, adding, cartResult, previewUrl}: AddedToCartPanelProps) {
  // The review page is much taller than this panel; without this the customer
  // lands scrolled past it, looking at the footer.
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({top: 0, behavior: reduceMotion ? 'auto' : 'smooth'});
  }, []);

  if (adding || !cartResult) {
    return (
      <div style={{textAlign: 'center', padding: '3rem 0'}} role="status" aria-live="polite">
        <p style={{color: '#fff', fontSize: '1.125rem'}}>Adding your token to the cart...</p>
      </div>
    );
  }

  const errorMessage = cartResult.errors?.find((e) => e?.message)?.message;
  if (errorMessage || !cartResult.cart) {
    return (
      <div style={{textAlign: 'center', padding: '3rem 0'}} role="alert">
        <p style={{color: '#f87171', fontSize: '1rem', marginBottom: '1rem'}}>
          {errorMessage ?? 'Something went wrong adding your token to the cart.'}
        </p>
        <Link to="/cart" style={{color: '#B8764F', fontSize: '0.875rem', textDecoration: 'underline'}}>
          View cart
        </Link>
      </div>
    );
  }

  const cart = cartResult.cart;
  const checkoutUrl: string | undefined = cart.checkoutUrl;
  const itemCount: number = cart.totalQuantity ?? 0;

  return (
    <div
      style={{
        textAlign: 'center',
        maxWidth: '28rem',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: '1rem 0',
      }}
      role="status"
      aria-live="polite"
    >
      {previewUrl ? (
        <div style={{position: 'relative', width: '10rem', height: '10rem', margin: '0 auto 1.5rem'}}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '9999px',
              background: 'rgba(184,118,79,0.2)',
              filter: 'blur(40px)',
              transform: 'scale(0.75)',
            }}
          />
          <img
            src={previewUrl}
            alt="Your custom token design"
            style={{position: 'relative', width: '100%', height: '100%', objectFit: 'contain', borderRadius: '9999px'}}
          />
        </div>
      ) : (
        <div
          style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '50%',
            background: '#B8764F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <span
        style={{
          display: 'inline-block',
          color: '#B8764F',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.25em',
          fontWeight: 600,
          marginBottom: '0.5rem',
        }}
      >
        Added to cart
      </span>
      <h2
        style={{
          fontFamily: 'var(--font-display, serif)',
          fontSize: '1.875rem',
          fontWeight: 700,
          color: '#FFFFFF',
          lineHeight: 1.2,
          marginBottom: '0.5rem',
        }}
      >
        Your token is ready
      </h2>
      <p style={{fontSize: '1rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.5)', marginBottom: '2rem'}}>
        Check out now, or design another token to add to this order.
      </p>

      <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
        {checkoutUrl ? (
          <a
            href={checkoutUrl}
            target="_self"
            style={primaryButtonStyle}
            onClick={() => {
              trackEvent('custom_token_post_cart', {path, choice: 'checkout'});
              trackBeginCheckout(cart);
            }}
          >
            Checkout
          </a>
        ) : (
          <Link to="/cart" style={primaryButtonStyle}>
            Go to cart
          </Link>
        )}
        <Link
          to="/custom-token"
          style={secondaryButtonStyle}
          onClick={() => trackEvent('custom_token_post_cart', {path, choice: 'design_another'})}
        >
          Design another token
        </Link>
      </div>

      <Link
        to="/cart"
        style={{
          display: 'inline-block',
          marginTop: '1.25rem',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '0.875rem',
          textDecoration: 'underline',
        }}
      >
        View cart{itemCount > 0 ? ` (${itemCount} ${itemCount === 1 ? 'item' : 'items'})` : ''}
      </Link>
    </div>
  );
}
