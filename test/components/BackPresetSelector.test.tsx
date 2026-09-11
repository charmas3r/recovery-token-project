// @vitest-environment jsdom
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {BackPresetSelector} from '~/components/custom-token/BackPresetSelector';

const presets = [
  {id: 'serenity-prayer', label: 'Serenity Prayer', imageUrl: 'https://cdn.shopify.com/serenity.png'},
  {id: 'unity-triangle', label: 'Unity Triangle', imageUrl: 'https://cdn.shopify.com/unity.png'},
];

describe('BackPresetSelector', () => {
  it('renders every preset with its label and image', () => {
    render(<BackPresetSelector presets={presets} onChange={() => {}} />);

    expect(screen.getByText('Serenity Prayer')).toBeInTheDocument();
    expect(screen.getByText('Unity Triangle')).toBeInTheDocument();
    expect(screen.getByAltText('Serenity Prayer')).toHaveAttribute('src', presets[0].imageUrl);
  });

  it('calls onChange with the preset id when clicked', async () => {
    const onChange = vi.fn();
    render(<BackPresetSelector presets={presets} onChange={onChange} />);

    await userEvent.click(screen.getByText('Unity Triangle'));

    expect(onChange).toHaveBeenCalledWith('unity-triangle');
  });

  it('disables all buttons when disabled is true', () => {
    render(<BackPresetSelector presets={presets} onChange={() => {}} disabled />);

    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
  });
});
