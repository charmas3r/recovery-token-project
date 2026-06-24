import {NavLink} from 'react-router';

/**
 * Custom Milestones logo mark.
 *
 * Concept: an engraved coin silhouette with a stylised "CM" letterform inside,
 * evoking the act of engraving — a burin-chisel stroke cuts the letterform into
 * a circular medal. Monochrome (white / soft warm-white) so it reads equally
 * well at header size (~32 px tall) and scales down to favicon use. No green,
 * no electric motifs; brand-safe for a sobriety / gift audience.
 */
export function CustomMilestonesLogo() {
  return (
    <NavLink
      prefetch="intent"
      to="/"
      end
      style={{display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none'}}
      aria-label="Custom Milestones — home"
    >
      {/* Icon mark: engraved coin */}
      <svg
        width="34"
        height="34"
        viewBox="0 0 34 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        {/* Outer coin ring */}
        <circle
          cx="17"
          cy="17"
          r="15.5"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="1.5"
        />
        {/* Inner recess ring — engraving-depth illusion */}
        <circle
          cx="17"
          cy="17"
          r="12.5"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="0.75"
        />
        {/* "M" for Milestones — styled as a chisel-engraved stroke */}
        <path
          d="M9.5 22.5 L9.5 12 L14 19 L17 14.5 L20 19 L24.5 12 L24.5 22.5"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Decorative tick marks at cardinal points — coin edge detail */}
        <line x1="17" y1="1" x2="17" y2="3.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="17" y1="30.5" x2="17" y2="33" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="1" y1="17" x2="3.5" y2="17" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="30.5" y1="17" x2="33" y2="17" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>

      {/* Wordmark */}
      <span
        style={{
          display: 'flex',
          flexDirection: 'column',
          lineHeight: 1,
          gap: '2px',
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontFamily: 'var(--font-display, Georgia, serif)',
            fontSize: '0.9375rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
          }}
        >
          Custom
        </span>
        <span
          style={{
            color: 'rgba(255,255,255,0.65)',
            fontFamily: 'var(--font-display, Georgia, serif)',
            fontSize: '0.6875rem',
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Milestones
        </span>
      </span>
    </NavLink>
  );
}
