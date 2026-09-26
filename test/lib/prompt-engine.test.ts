import {describe, it, expect} from 'vitest';
import {buildTokenPrompt, buildRefinementPrompt} from '~/lib/ai/prompt-engine';

// Guards the constraints the depth-map pipeline and the site owner rely on.
function expectCoreConstraints(prompt: string) {
  expect(prompt).toMatch(/perfect circle/i);
  expect(prompt).toMatch(/zero tilt/i);
  expect(prompt).toMatch(/matte antique bronze/i);
  expect(prompt).toMatch(/not polished gold/i);
  expect(prompt).toMatch(/pure solid black/i);
  expect(prompt).not.toMatch(/3mm thick|reeded edge/i);
}

describe('prompt-engine', () => {
  it('buildTokenPrompt leads with the head-on view requirement', () => {
    const prompt = buildTokenPrompt('a phoenix rising');
    expect(prompt.startsWith('Straight-on, front-facing')).toBe(true);
    expect(prompt).toContain('Design on the coin face: a phoenix rising');
    expectCoreConstraints(prompt);
  });

  it('buildTokenPrompt keeps enamel metal matte for the color material', () => {
    const prompt = buildTokenPrompt('a lotus', {material: 'color'});
    expect(prompt).toMatch(/enamel/i);
    expectCoreConstraints(prompt);
  });

  it('buildRefinementPrompt includes the original design and the requested change', () => {
    const prompt = buildRefinementPrompt('a lotus', 'make it bigger', 'brass');
    expect(prompt).toContain('The current design on the coin: a lotus');
    expect(prompt).toContain('Requested changes: make it bigger');
    expectCoreConstraints(prompt);
  });
});
