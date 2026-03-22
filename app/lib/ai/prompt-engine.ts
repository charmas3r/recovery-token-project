const SYSTEM_PREFIX = `Design a circular recovery/sobriety token coin.
The design must work as a physical engraved coin:
- Circular composition, fits within a circle border
- High contrast suitable for metal engraving
- Clean lines, no photographic elements
- Front face design (text/symbols centered)
- Metallic coin aesthetic`;

const STYLE_SUFFIX = `Style: detailed coin engraving illustration,
metallic surface, raised relief design,
professional commemorative coin aesthetic.
Top-down view of a single coin on dark background.`;

export function buildTokenPrompt(
  customerPrompt: string,
  options?: {
    occasion?: string;
    material?: 'brass' | 'color';
  },
): string {
  const materialHint =
    options?.material === 'color'
      ? 'Colorful enamel coin design with vibrant fills.'
      : 'Polished brass coin with silver engraving lines.';

  const occasionHint = options?.occasion
    ? `This token celebrates: ${options.occasion}.`
    : '';

  return [SYSTEM_PREFIX, materialHint, occasionHint, `Customer's design vision: ${customerPrompt}`, STYLE_SUFFIX]
    .filter(Boolean)
    .join('\n');
}

export function buildRefinementPrompt(
  originalPrompt: string,
  refinement: string,
): string {
  return [
    SYSTEM_PREFIX,
    `Previous design: ${originalPrompt}`,
    `Customer's requested changes: ${refinement}`,
    'Apply the requested changes while keeping the overall token design intact.',
    STYLE_SUFFIX,
  ].join('\n');
}
