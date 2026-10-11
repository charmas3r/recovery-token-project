import {describe, it, expect} from 'vitest';
import {
  BACK_PRESETS,
  DEFAULT_BACK_PRESET_ID,
  getBackPresetById,
  getBackPresetAbsoluteUrl,
  getDefaultBackPreset,
} from '~/lib/custom-token-presets';

describe('custom-token-presets', () => {
  it('has at least one preset and every preset has a non-empty id/label/imageUrl/accentColor', () => {
    expect(BACK_PRESETS.length).toBeGreaterThan(0);
    for (const preset of BACK_PRESETS) {
      expect(preset.id).not.toBe('');
      expect(preset.label).not.toBe('');
      expect(preset.imageUrl).not.toBe('');
      expect(preset.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
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

  it('getBackPresetAbsoluteUrl resolves a root-relative dev path against the request origin', () => {
    const preset = {...getDefaultBackPreset(), imageUrl: '/app/assets/back.webp'};
    expect(getBackPresetAbsoluteUrl(preset, 'https://shop.test/custom-token/you-design/back')).toBe(
      'https://shop.test/app/assets/back.webp',
    );
  });

  it('getBackPresetAbsoluteUrl keeps an absolute CDN url untouched', () => {
    const cdnUrl = 'https://cdn.shopify.com/oxygen-v2/1/2/3/assets/back-abc123.webp';
    const preset = {...getDefaultBackPreset(), imageUrl: cdnUrl};
    expect(getBackPresetAbsoluteUrl(preset, 'https://shop.test/custom-token/you-design/back')).toBe(cdnUrl);
  });
});
