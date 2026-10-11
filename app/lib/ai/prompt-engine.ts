// Output feeds a depth-map generator, so the camera angle and lighting rules
// matter more than aesthetics: the coin must read as a perfect circle with no
// baked-in shadows or highlights.
const VIEW_REQUIREMENTS = `Straight-on, front-facing orthographic view of a single coin face, like a flat scanner image.
The camera is perfectly perpendicular to the coin face: zero tilt, zero perspective.
The coin is a perfect circle (not an oval), centered, filling about 90% of the frame.
The coin's edge, rim thickness and side are not visible. No drop shadow, no reflection beneath it.`;

const SYSTEM_PREFIX = `Commemorative challenge coin, die-struck metal medallion.
Crisp raised relief with clear, distinct height levels: a flat recessed background field, raised design elements above it, and a raised border rim.
Circular composition with text and symbols arranged within the coin face.`;

const BRONZE_MATERIAL = `Material: matte antique bronze.
Dark brown-bronze tone with a soft, non-reflective, brushed matte finish.
Recessed areas are slightly darker where the patina settles.
No mirror shine, no specular highlights, no glossy reflections.
It is not polished gold and not shiny brass.`;

const COLOR_MATERIAL = `Material: full-color enamel coin. Color is the dominant feature of the design.
The recessed areas of the coin face are filled with bright, saturated enamel in multiple distinct colors (for example deep blue, red, green, white, yellow), chosen to suit the design.
Each colored region is cleanly separated by thin raised metal outlines, like a cloisonné enamel pin.
Only the thin outlines, rim and lettering are metal: matte antique bronze, non-reflective, no shine.
The metal is not polished gold and not shiny brass. The coin must not look like plain uncolored metal.`;

const PHOTOGRAPHY_STYLE = `Lighting: soft, even, diffuse light from directly in front of the coin.
No strong directional light, no hard shadows, no bright hotspots, no glow or halo around the coin.
Background: pure solid black, with a clean, sharp edge between coin and background.
Sharp focus across the entire coin face, no blur, no vignette, no watermarks.
Render any lettering exactly as described; do not add any extra text.`;

const BRONZE_CHECKLIST = `Must: perfect circle, head-on view, matte bronze (not shiny gold), even lighting, pure black background.`;

const COLOR_CHECKLIST = `Must: perfect circle, head-on view, vivid multi-color enamel fills with matte bronze outlines (not shiny gold), even lighting, pure black background.`;

function materialParts(material?: 'brass' | 'color') {
  return material === 'color'
    ? {materialDesc: COLOR_MATERIAL, checklist: COLOR_CHECKLIST}
    : {materialDesc: BRONZE_MATERIAL, checklist: BRONZE_CHECKLIST};
}

export function buildTokenPrompt(
  customerPrompt: string,
  options?: {
    material?: 'brass' | 'color';
  },
): string {
  const {materialDesc, checklist} = materialParts(options?.material);

  return [
    VIEW_REQUIREMENTS,
    SYSTEM_PREFIX,
    materialDesc,
    `Design on the coin face: ${customerPrompt}`,
    PHOTOGRAPHY_STYLE,
    checklist,
  ].join('\n');
}

export function buildRefinementPrompt(
  originalPrompt: string,
  refinement: string,
  material?: 'brass' | 'color',
): string {
  const {materialDesc, checklist} = materialParts(material);
  return [
    VIEW_REQUIREMENTS,
    SYSTEM_PREFIX,
    materialDesc,
    `The current design on the coin: ${originalPrompt}`,
    `Requested changes: ${refinement}`,
    'Apply the changes while keeping the same coin, camera angle, finish and lighting.',
    PHOTOGRAPHY_STYLE,
    checklist,
  ].join('\n');
}
