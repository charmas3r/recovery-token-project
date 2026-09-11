import {describe, it, expect} from 'vitest';
import {
  BACK_PRESETS,
  DEFAULT_BACK_PRESET_ID,
  getBackPresetById,
  getDefaultBackPreset,
} from '~/lib/custom-token-presets';

describe('custom-token-presets', () => {
  it('has at least one preset and every preset has a non-empty id/label/fileGid', () => {
    expect(BACK_PRESETS.length).toBeGreaterThan(0);
    for (const preset of BACK_PRESETS) {
      expect(preset.id).not.toBe('');
      expect(preset.label).not.toBe('');
      expect(preset.fileGid).not.toBe('');
    }
  });

  it('has a DEFAULT_BACK_PRESET_ID that exists in BACK_PRESETS', () => {
    expect(getBackPresetById(DEFAULT_BACK_PRESET_ID)).toBeDefined();
  });

  it('getBackPresetById returns undefined for an unknown id', () => {
    expect(getBackPresetById('does-not-exist')).toBeUndefined();
  });

  it('getDefaultBackPreset returns the preset matching DEFAULT_BACK_PRESET_ID', () => {
    expect(getDefaultBackPreset().id).toBe(DEFAULT_BACK_PRESET_ID);
  });

  // Guard-rail: BACK_PRESETS still ships with placeholder fileGid values pending
  // real Shopify File uploads by the business. Un-skip this once those are swapped in.
  it.skip('does not ship placeholder fileGid values', () => {
    for (const preset of BACK_PRESETS) {
      expect(preset.fileGid).not.toMatch(/MediaImage\/0{9}\d$/);
    }
  });
});
