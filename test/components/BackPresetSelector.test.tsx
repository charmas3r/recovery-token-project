// @vitest-environment jsdom
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {BackPresetSelector} from '~/components/custom-token/BackPresetSelector';

const options = [
  {
    id: 'serenity-prayer',
    label: 'Serenity Prayer',
    imageUrl: 'https://cdn.example.com/serenity.png',
    accentColor: '#87755E',
  },
  {
    id: 'custom',
    label: 'AI Custom Design',
    isCustom: true,
    description: 'Describe it, AI creates it',
  },
];

describe('BackPresetSelector', () => {
  it('renders exactly the preset option and the AI custom option, equally', () => {
    render(<BackPresetSelector options={options} onChange={() => {}} />);

    expect(screen.getByText('Serenity Prayer')).toBeInTheDocument();
    expect(screen.getByAltText('Serenity Prayer')).toHaveAttribute('src', options[0].imageUrl);
    expect(screen.getByText('AI Custom Design')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('calls onChange with the option id when clicked', async () => {
    const onChange = vi.fn();
    render(<BackPresetSelector options={options} onChange={onChange} />);

    await userEvent.click(screen.getByText('AI Custom Design'));

    expect(onChange).toHaveBeenCalledWith('custom');
  });

  it('disables all buttons when disabled is true', () => {
    render(<BackPresetSelector options={options} onChange={() => {}} disabled />);

    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
  });

  it('renders a placeholder instead of a broken image when a preset has no imageUrl', () => {
    const optionsWithMissingImage = [
      {id: 'serenity-prayer', label: 'Serenity Prayer', imageUrl: ''},
    ];
    render(<BackPresetSelector options={optionsWithMissingImage} onChange={() => {}} />);

    expect(screen.queryByAltText('Serenity Prayer')).not.toBeInTheDocument();
    expect(screen.getByText('Serenity Prayer')).toBeInTheDocument();
  });

  it('renders an icon (not a broken image) for the custom option', () => {
    render(<BackPresetSelector options={[options[1]]} onChange={() => {}} />);

    expect(screen.queryByAltText('AI Custom Design')).not.toBeInTheDocument();
    expect(screen.getByText('AI Custom Design')).toBeInTheDocument();
  });
});
