/**
 * coinTextures.ts — Canvas 2D texture generation for coin front/back faces.
 * Generates 512×512 textures with bronze gradients, details, and specular highlights.
 */

import * as THREE from 'three';

const TEX_SIZE = 512;
const HALF = TEX_SIZE / 2;

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
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

/* ─── Base gradient shared by both faces ─────────────────────── */

function drawBaseGradient(
  ctx: CanvasRenderingContext2D,
  accentColor: string,
) {
  const grad = ctx.createRadialGradient(
    HALF * 0.8,
    HALF * 0.7,
    0,
    HALF,
    HALF,
    HALF,
  );
  grad.addColorStop(0, lighten(accentColor, 0.4));
  grad.addColorStop(0.4, accentColor);
  grad.addColorStop(0.75, darken(accentColor, 0.3));
  grad.addColorStop(1, darken(accentColor, 0.5));

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(HALF, HALF, HALF, 0, Math.PI * 2);
  ctx.fill();
}

/* ─── Specular highlight overlay ─────────────────────────────── */

function drawSpecularHighlight(ctx: CanvasRenderingContext2D) {
  const grad = ctx.createRadialGradient(
    HALF * 0.8,
    HALF * 0.6,
    0,
    HALF * 0.8,
    HALF * 0.6,
    HALF * 0.5,
  );
  grad.addColorStop(0, 'rgba(255,255,255,0.2)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(HALF, HALF, HALF, 0, Math.PI * 2);
  ctx.fill();
}

/* ─── Front face texture ─────────────────────────────────────── */

function drawFrontFace(
  ctx: CanvasRenderingContext2D,
  accentColor: string,
) {
  drawBaseGradient(ctx, accentColor);

  // Engraved Coin-Plugz "C" logo (from site header SVG, viewBox 0 0 58 58)
  // Scale SVG coordinates (58×58) to fit ~45% of the texture, centered
  const logoScale = (TEX_SIZE * 0.45) / 58;
  const cx = HALF;
  const cy = HALF - TEX_SIZE * 0.03;
  const ox = cx - 29 * logoScale; // offset to center the 58×58 viewBox
  const oy = cy - 29 * logoScale;

  // Engraving colors: dark groove with a subtle top-edge highlight
  const grooveColor = darken(accentColor, 0.25);
  const highlightColor = lighten(accentColor, 0.15);

  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(logoScale, logoScale);

  // Outer circle
  ctx.beginPath();
  ctx.arc(29, 29, 26, 0, Math.PI * 2);
  ctx.strokeStyle = grooveColor;
  ctx.lineWidth = 1.5 / logoScale;
  ctx.globalAlpha = 0.35;
  ctx.stroke();

  // "C" shape
  ctx.beginPath();
  ctx.moveTo(40, 16);
  ctx.lineTo(22, 16);
  ctx.quadraticCurveTo(10, 16, 10, 29);
  ctx.quadraticCurveTo(10, 42, 22, 42);
  ctx.lineTo(40, 42);
  ctx.strokeStyle = grooveColor;
  ctx.lineWidth = 4.5 / logoScale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 0.7;
  ctx.stroke();

  // Highlight pass offset 1px up-left for engraved depth
  ctx.beginPath();
  ctx.moveTo(39.5, 15);
  ctx.lineTo(21.5, 15);
  ctx.quadraticCurveTo(9.5, 15, 9.5, 28);
  ctx.quadraticCurveTo(9.5, 41, 21.5, 41);
  ctx.lineTo(39.5, 41);
  ctx.strokeStyle = highlightColor;
  ctx.lineWidth = 1.2 / logoScale;
  ctx.globalAlpha = 0.25;
  ctx.stroke();

  // Lightning bolt
  ctx.beginPath();
  ctx.moveTo(36, 10);
  ctx.lineTo(28, 26);
  ctx.lineTo(38, 26);
  ctx.lineTo(26, 48);
  ctx.strokeStyle = grooveColor;
  ctx.lineWidth = 3 / logoScale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 0.45;
  ctx.stroke();

  // Endpoint dots
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = grooveColor;
  ctx.beginPath();
  ctx.arc(36, 10, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(26, 48, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Spark lines
  ctx.strokeStyle = grooveColor;
  ctx.lineWidth = 2 / logoScale;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(42, 18);
  ctx.lineTo(46, 14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(42, 40);
  ctx.lineTo(46, 44);
  ctx.stroke();

  ctx.restore();
  ctx.globalAlpha = 1;

  // "40mm" label
  ctx.fillStyle = darken(accentColor, 0.15);
  ctx.font = `bold ${TEX_SIZE * 0.07}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('40mm', HALF, HALF + TEX_SIZE * 0.16);

  drawSpecularHighlight(ctx);
}

/* ─── Back face texture ──────────────────────────────────────── */

function drawBackFace(
  ctx: CanvasRenderingContext2D,
  accentColor: string,
) {
  drawBaseGradient(ctx, accentColor);

  // Concentric rings
  const ringColor = darken(accentColor, 0.2);
  ctx.strokeStyle = ringColor;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.5;
  for (const scale of [0.55, 0.4, 0.25]) {
    ctx.beginPath();
    ctx.arc(HALF, HALF, (HALF * scale), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // "3mm" label
  ctx.fillStyle = darken(accentColor, 0.15);
  ctx.font = `bold ${TEX_SIZE * 0.07}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('3mm', HALF, HALF);

  drawSpecularHighlight(ctx);
}

/* ─── Public API ─────────────────────────────────────────────── */

export function createFrontTexture(accentColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  const ctx = canvas.getContext('2d')!;
  drawFrontFace(ctx, accentColor);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createBackTexture(accentColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  const ctx = canvas.getContext('2d')!;
  drawBackFace(ctx, accentColor);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
