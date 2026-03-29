const SYSTEM_PREFIX = `Product photo of a commemorative challenge coin.
The coin is a premium collectible medallion:
- 40mm diameter, 3mm thick
- Precision die-struck with a reeded edge
- Raised relief design with fine detail
- Circular composition with text and symbols arranged within the coin face`;

const BRASS_MATERIAL = `Material: antique-plated brass with a warm bronze patina.
Satin metallic sheen with subtle tonal variation.
Recessed areas appear darker where the patina settles.
Raised elements catch the light with a soft golden highlight.
The finish has a handcrafted quality with natural plating variation.`;

const COLOR_MATERIAL = `Material: brass base with hand-applied enamel color accents.
Recessed areas filled with vibrant enamel in rich, saturated tones.
Raised metal borders and text remain polished brass, creating contrast.
The enamel has a smooth, slightly glossy fill with vivid but natural-looking colors.`;

const PHOTOGRAPHY_STYLE = `Photography: studio product photo on a pure black background.
Top-down flat lay showing the full coin face.
Soft warm directional lighting from upper-left with subtle highlights on raised metal.
Gentle bronze-toned ambient glow around the edges.
Premium ecommerce product listing style.
Sharp focus, clean, a single coin centered in frame.`;

export function buildTokenPrompt(
  customerPrompt: string,
  options?: {
    occasion?: string;
    material?: 'brass' | 'color';
  },
): string {
  const materialDesc = options?.material === 'color' ? COLOR_MATERIAL : BRASS_MATERIAL;

  const occasionHint = options?.occasion
    ? `This coin commemorates a personal milestone.`
    : '';

  return [
    SYSTEM_PREFIX,
    materialDesc,
    occasionHint,
    `Design on the coin face: ${customerPrompt}`,
    PHOTOGRAPHY_STYLE,
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildRefinementPrompt(
  originalPrompt: string,
  refinement: string,
  material?: 'brass' | 'color',
): string {
  const materialDesc = material === 'color' ? COLOR_MATERIAL : BRASS_MATERIAL;
  return [
    SYSTEM_PREFIX,
    materialDesc,
    `The current design on the coin: ${originalPrompt}`,
    `Requested changes: ${refinement}`,
    'Apply the changes while keeping the same coin appearance and photography style.',
    PHOTOGRAPHY_STYLE,
  ].join('\n');
}
