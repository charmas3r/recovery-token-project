export interface BackPreset {
  id: string;
  label: string;
  fileGid: string;
}

// Replace these fileGid values with real Shopify File GIDs after uploading
// the preset images via Admin → Content → Files.
export const BACK_PRESETS: BackPreset[] = [
  {
    id: 'serenity-prayer',
    label: 'Serenity Prayer',
    fileGid: 'gid://shopify/MediaImage/0000000000001',
  },
  {
    id: 'unity-triangle',
    label: 'Unity Triangle',
    fileGid: 'gid://shopify/MediaImage/0000000000002',
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
