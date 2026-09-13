export interface BackPreset {
  id: string;
  label: string;
  /** Path under /public, e.g. served at `${origin}${imageUrl}`. */
  imageUrl: string;
  /** Hex accent used for this preset's selected-state border/glow. */
  accentColor: string;
}

export const BACK_PRESETS: BackPreset[] = [
  {
    id: 'serenity-prayer',
    label: 'Serenity Prayer',
    imageUrl: '/assets/custom-token/serenity-prayer-back.webp',
    accentColor: '#87755E',
  },
];

export const DEFAULT_BACK_PRESET_ID = 'serenity-prayer';

export function getBackPresetById(id: string): BackPreset | undefined {
  return BACK_PRESETS.find((preset) => preset.id === id);
}

export function getDefaultBackPreset(): BackPreset {
  const preset = getBackPresetById(DEFAULT_BACK_PRESET_ID);
  if (!preset) {
    throw new Error(
      `DEFAULT_BACK_PRESET_ID "${DEFAULT_BACK_PRESET_ID}" not found in BACK_PRESETS`,
    );
  }
  return preset;
}
