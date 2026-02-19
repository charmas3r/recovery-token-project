/**
 * CoinModel — SSR-safe wrapper that lazy-loads the WebGL coin scene.
 * Falls back to CSS 3D coin for SSR, reduced-motion, or no-WebGL.
 */

import {lazy, Suspense, useEffect, useState} from 'react';
import {useReducedMotion} from 'framer-motion';
import {CoinModelFallback} from './CoinModelFallback';

const CoinModelCanvas = lazy(() => import('./CoinModelCanvas'));

interface CoinModelProps {
  /** Canvas container size in CSS pixels */
  size?: number;
  /** Coin diameter in mm (default 40) */
  diameterMm?: number;
  /** Coin thickness in mm (default 3) */
  thicknessMm?: number;
  /** Bronze accent color */
  accentColor?: string;
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl') || canvas.getContext('webgl2')
    );
  } catch {
    return false;
  }
}

/** Convert mm to CSS pixels at 96 DPI */
function mmToPx(mm: number): number {
  return Math.round(mm * (96 / 25.4));
}

export function CoinModel({
  size = 200,
  diameterMm = 40,
  thicknessMm = 3,
  accentColor = '#B8764F',
}: CoinModelProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isClient, setIsClient] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);

  // Fallback uses pixel sizes derived from mm
  const fallbackSizePx = mmToPx(diameterMm);
  const fallbackThickPx = mmToPx(thicknessMm);

  useEffect(() => {
    setIsClient(true);
    setWebGLSupported(hasWebGL());
  }, []);

  // SSR, reduced-motion, or no WebGL: show static CSS fallback
  if (!isClient || shouldReduceMotion || !webGLSupported) {
    return (
      <CoinModelFallback
        size={fallbackSizePx}
        thickness={fallbackThickPx}
        accentColor={accentColor}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`Interactive 3D recovery token: ${diameterMm}mm diameter, ${thicknessMm}mm thick. Drag to rotate.`}
      style={{
        width: `${size}px`,
        height: `${size + 28}px`,
        flexShrink: 0,
      }}
    >
      <Suspense
        fallback={
          <CoinModelFallback
            size={fallbackSizePx}
            thickness={fallbackThickPx}
            accentColor={accentColor}
          />
        }
      >
        <CoinModelCanvas
          size={size}
          diameterMm={diameterMm}
          thicknessMm={thicknessMm}
          accentColor={accentColor}
        />
      </Suspense>
      <p
        style={{
          textAlign: 'center',
          fontSize: '0.6875rem',
          color: 'rgba(255,255,255,0.3)',
          marginTop: '8px',
          userSelect: 'none',
        }}
      >
        Drag to rotate
      </p>
    </div>
  );
}
