const SYSTEM_PREFIX = `Product photo of a real, physical commemorative challenge coin.
The coin is a premium collectible medallion:
- 40mm diameter, 3mm thick, slightly larger than a US half-dollar
- Precision die-struck with a reeded edge
- Raised relief design with fine detail
- Circular composition with text and symbols arranged within the coin face`;

const BRASS_MATERIAL = `Material: antique-plated brass alloy with a warm bronze patina.
The surface has a satin metallic sheen with subtle tonal variation from the plating process.
Engraved lines and recessed areas appear darker where the patina settles.
Raised elements catch the light with a soft golden highlight.
The finish looks handcrafted — minor natural variations in the plating give it character.`;

const COLOR_MATERIAL = `Material: brass alloy base with hand-applied enamel color accents.
Recessed areas are filled with vibrant enamel paint in rich, saturated tones.
Raised metal borders and text remain polished brass, creating contrast between metal and color.
The enamel has a smooth, slightly glossy fill. Colors are vivid but not cartoonish — they look like real applied pigment.`;

const PHOTOGRAPHY_STYLE = `Photography: studio product photo on a pure black background.
Shot from directly above (top-down, flat lay) showing the full coin face.
Soft, warm directional lighting from upper-left creates subtle highlights on the raised metal surfaces.
Gentle bronze-toned ambient glow around the coin edges.
The image looks like it belongs in a premium ecommerce product listing.
Sharp focus, no blur, no vignette, no text overlays, no watermarks.
A single coin centered in frame with some breathing room around it.
The photo is indistinguishable from a real product photo of a physical coin.`;

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
    'Apply the changes while keeping the same physical coin appearance and photography style.',
    PHOTOGRAPHY_STYLE,
  ].join('\n');
}
