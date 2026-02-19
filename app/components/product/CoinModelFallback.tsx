/**
 * CoinModelFallback — Static CSS 3D coin for SSR, reduced-motion, and no-WebGL.
 * Extracted from the original CoinModel.tsx CSS transform implementation.
 */

interface CoinModelFallbackProps {
  size?: number;
  thickness?: number;
  accentColor?: string;
}

const EDGE_SEGMENTS = 60;

export function CoinModelFallback({
  size = 151,
  thickness = 11,
  accentColor = '#B8764F',
}: CoinModelFallbackProps) {
  const radius = size / 2;
  const halfThick = thickness / 2;

  const segWidth =
    Math.ceil((2 * Math.PI * radius) / EDGE_SEGMENTS) + 1;
  const edgeSegments = Array.from({length: EDGE_SEGMENTS}, (_, i) => {
    const angle = (i * 360) / EDGE_SEGMENTS;
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          width: `${segWidth}px`,
          height: `${thickness}px`,
          left: '50%',
          top: '50%',
          marginLeft: `${-segWidth / 2}px`,
          marginTop: `${-thickness / 2}px`,
          transform: `rotateY(${angle}deg) translateZ(${radius - 0.5}px)`,
          background: `linear-gradient(180deg,
            ${lighten(accentColor, 0.3)} 0%,
            ${accentColor} 30%,
            ${darken(accentColor, 0.3)} 70%,
            ${darken(accentColor, 0.5)} 100%)`,
        }}
      />
    );
  });

  return (
    <div
      role="img"
      aria-label="Recovery token: 40mm diameter, 3mm thick"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        perspective: '600px',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: 'rotateX(15deg) rotateY(30deg)',
        }}
      >
        <CoinFace
          side="front"
          size={size}
          halfThick={halfThick}
          accentColor={accentColor}
        />
        <CoinFace
          side="back"
          size={size}
          halfThick={halfThick}
          accentColor={accentColor}
        />
        {edgeSegments}
        <EdgeDimension size={size} thickness={thickness} />
      </div>
      <p
        style={{
          textAlign: 'center',
          fontSize: '0.6875rem',
          color: 'rgba(255,255,255,0.3)',
          marginTop: '8px',
        }}
      >
        40mm × 3mm
      </p>
    </div>
  );
}

/* ─── Coin Face ──────────────────────────────────────────────── */

function CoinFace({
  side,
  size,
  halfThick,
  accentColor,
}: {
  side: 'front' | 'back';
  size: number;
  halfThick: number;
  accentColor: string;
}) {
  const isFront = side === 'front';

  return (
    <div
      style={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        transform: isFront
          ? `translateZ(${halfThick}px)`
          : `rotateY(180deg) translateZ(${halfThick}px)`,
        backfaceVisibility: 'hidden',
        background: `radial-gradient(circle at 40% 35%,
          ${lighten(accentColor, 0.4)} 0%,
          ${accentColor} 40%,
          ${darken(accentColor, 0.3)} 75%,
          ${darken(accentColor, 0.5)} 100%)`,
        boxShadow: `inset 0 2px 4px rgba(255,255,255,0.2),
          inset 0 -2px 4px rgba(0,0,0,0.4),
          inset 2px 0 4px rgba(255,255,255,0.1),
          inset -2px 0 4px rgba(0,0,0,0.2)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Static specular highlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse 40% 40% at 40% 30%, rgba(255,255,255,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {isFront ? (
        <FrontContent size={size} accentColor={accentColor} />
      ) : (
        <BackContent size={size} accentColor={accentColor} />
      )}
    </div>
  );
}

/* ─── Face Content ───────────────────────────────────────────── */

function FrontContent({
  size,
  accentColor,
}: {
  size: number;
  accentColor: string;
}) {
  const logoSize = size * 0.45;
  const groove = darken(accentColor, 0.25);
  return (
    <>
      <svg
        width={logoSize}
        height={logoSize}
        viewBox="0 0 58 58"
        fill="none"
        style={{marginBottom: size * 0.02, position: 'relative'}}
      >
        <circle cx="29" cy="29" r="26" stroke={groove} strokeWidth="1" opacity="0.35" />
        <path
          d="M40 16 L22 16 Q10 16 10 29 Q10 42 22 42 L40 42"
          stroke={groove}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
        <path
          d="M36 10 L28 26 L38 26 L26 48"
          stroke={groove}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
        />
        <circle cx="36" cy="10" r="2" fill={groove} opacity="0.5" />
        <circle cx="26" cy="48" r="2" fill={groove} opacity="0.5" />
        <path d="M42 18 L46 14" stroke={groove} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <path d="M42 40 L46 44" stroke={groove} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      </svg>
      <span
        style={{
          fontSize: `${size * 0.09}px`,
          fontWeight: 700,
          color: darken(accentColor, 0.15),
          textShadow: '0 1px 1px rgba(255,255,255,0.15)',
          letterSpacing: '0.1em',
          position: 'relative',
        }}
      >
        40mm
      </span>
    </>
  );
}

function BackContent({
  size,
  accentColor,
}: {
  size: number;
  accentColor: string;
}) {
  const ringColor = darken(accentColor, 0.2);
  return (
    <>
      {[0.55, 0.4, 0.25].map((scale) => (
        <div
          key={scale}
          style={{
            position: 'absolute',
            width: `${size * scale}px`,
            height: `${size * scale}px`,
            borderRadius: '50%',
            border: `1px solid ${ringColor}`,
            opacity: 0.5,
          }}
        />
      ))}
      <span
        style={{
          fontSize: `${size * 0.09}px`,
          fontWeight: 700,
          color: darken(accentColor, 0.15),
          textShadow: '0 1px 1px rgba(255,255,255,0.15)',
          letterSpacing: '0.1em',
          position: 'relative',
        }}
      >
        3mm
      </span>
    </>
  );
}

/* ─── Edge Dimension Annotation ──────────────────────────────── */

function EdgeDimension({
  size,
  thickness,
}: {
  size: number;
  thickness: number;
}) {
  const radius = size / 2;
  const bracketHeight = Math.max(thickness, 24);
  const halfBracket = bracketHeight / 2;
  const tickWidth = 10;
  const lineX = tickWidth - 1;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transformStyle: 'preserve-3d',
        transform: `rotateY(90deg) translateZ(${radius + 4}px)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: `${tickWidth}px`,
          height: '2px',
          background: 'rgba(255,255,255,0.8)',
          top: `${-halfBracket}px`,
          left: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '2px',
          height: `${bracketHeight}px`,
          background: 'rgba(255,255,255,0.6)',
          top: `${-halfBracket}px`,
          left: `${lineX}px`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: `${tickWidth}px`,
          height: '2px',
          background: 'rgba(255,255,255,0.8)',
          top: `${halfBracket - 2}px`,
          left: 0,
        }}
      />
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: `${tickWidth + 6}px`,
          transform: 'translateY(-50%)',
          fontSize: '13px',
          fontWeight: 700,
          color: '#FFFFFF',
          whiteSpace: 'nowrap',
          letterSpacing: '0.05em',
          textShadow: '0 0 6px rgba(0,0,0,0.8)',
        }}
      >
        3mm
      </span>
    </div>
  );
}

/* ─── Color Utilities ────────────────────────────────────────── */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((c) =>
      Math.round(c)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    Math.min(255, r + (255 - r) * amount),
    Math.min(255, g + (255 - g) * amount),
    Math.min(255, b + (255 - b) * amount),
  );
}

function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    r * (1 - amount),
    g * (1 - amount),
    b * (1 - amount),
  );
}
