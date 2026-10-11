// Imported (not served from /public) so the build fingerprints it and points
// it at the Oxygen CDN; Oxygen doesn't serve /public files from the
// storefront origin, and the CSP img-src doesn't allow 'self'.
import serenityPrayerBackUrl from '~/assets/custom-token/serenity-prayer-back.webp';

export interface BackPreset {
  id: string;
  label: string;
  /** Absolute CDN URL in production, root-relative path in dev. */
  imageUrl: string;
  /** Hex accent used for this preset's selected-state border/glow. */
  accentColor: string;
}

export const BACK_PRESETS: BackPreset[] = [
  {
    id: 'serenity-prayer',
    label: 'Serenity Prayer',
    imageUrl: serenityPrayerBackUrl,
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

/** Absolute URL for a preset image, safe to store on an order line item. */
export function getBackPresetAbsoluteUrl(preset: BackPreset, requestUrl: string): string {
  return new URL(preset.imageUrl, requestUrl).toString();
}
